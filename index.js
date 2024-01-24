import express from "express";
import cors from "cors";
const app = express();
import UserModel from "./user.model.js";

// Import routes module
app.use(express.json());
app.use(cors());
// Use routes module
app.post("/signup", async (req, res) => {
  const { name, username, email, password } = req.body;
  try {
    console.log(req.body);
    const userData = new UserModel({ name, username, email, password });
    const savedUser = userData.save();
    res.status(201).json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/data", async (req, res) => {
  const userData = await UserModel.find();
  res.json(userData);
});
app.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("User ID:", id);

    const userData = await UserModel.findById(id);
    res.status(201).json(userData);
  } catch (err) {
    console.log(err.message);
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
