const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const globalErrorHandler = require("./Controllers/errorController.js");
const userRoutes = require("./Routes/userRoutes.js");
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: ["http://localhost:8081"], credentials: true }));
app.use(morgan("dev"));
app.use(express.json());

app.get('/api/getmsg',(req,res)=>{
    res.status(200).json({ message: "Hello" });
})

// Routes
app.use("/api/users", userRoutes);

// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
