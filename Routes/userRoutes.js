const express = require("express");
const userController = require("../Controllers/userController.js");

const userRoutes = express.Router();

// Legacy routes (keeping for backward compatibility)
userRoutes.route('/create').post(userController.createUser);
userRoutes.route('/all').get(userController.getAllUsers);


module.exports = userRoutes;