import express from "express";
import cors from "cors";
const app = express();
import UserModel from "./user.model.js";
import bcrypt from "bcrypt"

// Import routes module
app.use(express.json());
app.use(cors());
// Use routes module
app.post("/signup", async (req, res) => {
  const { name, username, email, password } = req.body;
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with the hashed password
    const userData = new UserModel({ name, username, email, password: hashedPassword });

    // Save the user to the database
    const savedUser = await userData.save();

    res.status(201).json(savedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/data", async (req, res) => {
  try {
    const userData = await UserModel.find();
    res.json(userData);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server errror");
  }
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
app.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body; // Assuming your updated data is in the request body

    // Use findByIdAndUpdate to find the document by id and update it
    const upData = await UserModel.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
      runValidators: true, // Run validators to ensure the updated data is valid
    });

    res.status(200).json(upData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
app.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await UserModel.findByIdAndDelete(id);
    res.status(201).json("Deleted");
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});
// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
