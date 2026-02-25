import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
// /
dotenv.config();

const app = express();
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use("/user", userRoutes);
// app.use(middleware());

// Home route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the home page" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`);
});
console.log(process.env.MONGO_URI);