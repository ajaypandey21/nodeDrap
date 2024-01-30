import express from "express";
import cors from "cors";
import UserModel from "./user.model.js";
import bcrypt from "bcrypt";
import { createClient } from "redis";
import Project from "./project.model.js";

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

// Enable preflight requests for all routes
app.options('*', cors());

const client = createClient();


client
  .connect()
  .then(() => console.log("Connected to Redis"))
  .catch((err) => console.error("Redis connection error:", err));

  app.patch("/api/projects/:id", async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;
  
    try {
      const project = await Project.findOneAndUpdate(
        { id },
        { data },
        { upsert: true, new: true }
      );
      res.json({ success: true, project });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  });
  
  // Endpoint to load GrapesJS project data
  app.get("/api/projects/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const project = await Project.findOne({ id });
      res.json({ success: true, project });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  });
  

// Redis caching middleware
const redisMiddleware = async (req, res, next) => {
  try {
    const { method, originalUrl } = req;
    const key = `${method}:${originalUrl}`;

    const cachedData = await client.get(key);
    if (cachedData) {
      res.json(JSON.parse(cachedData));
      return;
    }

    // If not cached, proceed to the route handler
    next();
  } catch (error) {
    console.error("Redis caching middleware error:", error);
    next();
  }
};

// Apply Redis caching middleware for the "/data" route
app.use("/data", redisMiddleware);

app.get("/data", async (req, res) => {
  try {
    // Fetch data from the database
    const userData = await UserModel.find();

    // Store fetched data in Redis cache with a dynamic key
    const key = `${req.method}:${req.originalUrl}`;
    await client.set(key, JSON.stringify(userData));
    await client.expire(key, 60); // Set cache expiration to 60 seconds (adjust as needed)

    res.json(userData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Use routes module
app.post("/signup", async (req, res) => {
  const { name, username, email, password } = req.body;
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with the hashed password
    const userData = new UserModel({
      name,
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    const savedUser = await userData.save();

    res.status(201).json(savedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Apply Redis caching middleware for the "/user/:id" route
app.use("/user/:id", redisMiddleware);

app.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("User ID:", id);

    const userData = await UserModel.findById(id);
    res.status(201).json(userData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const upData = await UserModel.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    // Invalidate cache for the updated user
    const key = `GET:/user/${id}`;
    await client.del(key);

    res.status(200).json(upData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// Endpoint to save GrapesJS project data


app.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await UserModel.findByIdAndDelete(id);

    // Invalidate cache for the deleted user
    const key = `GET:/user/${id}`;
    await client.del(key);

    res.status(201).json("Deleted");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


