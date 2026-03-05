const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
dotenv.config();
const globalErrorHandler = require("./Controllers/errorController.js");
const userRoutes = require("./Routes/userRoutes.js");
const emergencyRoutes = require("./Routes/emergencyRoutes.js");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:8081",
      "http://localhost:19006"
    ],
    credentials: true
  })
);
app.use(morgan("dev"));
app.use(express.json());

app.get('/api/getmsg',(req,res)=>{
    res.status(200).json({ message: "Hello" });
})

app.post("/wisprnet",(req,res)=>{
    const data = req.body;
    console.log("Received data:", data);
    res.status(200).json({ message: "Data received successfully", receivedData: data });
})

// Routes
app.use("/api/users", userRoutes);
app.use("/api", emergencyRoutes);

// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
