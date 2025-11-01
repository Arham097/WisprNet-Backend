const User = require("../Models/userModel.js");
const asyncErrorHandler = require("../utils/asyncErrorHandler.js");


// Create a new user
exports.createUser = asyncErrorHandler(async (req, res, next) => {
    const { name, phone } = req.body;
    const newUser = await User.create({ name, phone });
    res.status(201).json({
        status: 'success',
        data: {
            user: newUser
        }
    });
});
// Get all users
exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: { 
            users
        }
    });
});