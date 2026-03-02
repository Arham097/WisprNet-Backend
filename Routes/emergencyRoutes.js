const express = require("express");
const emergencyController = require("../Controllers/emergencyController.js");

const emergencyRoutes = express.Router();

emergencyRoutes.post("/emergency-sms", emergencyController.handleEmergencySms);
emergencyRoutes.post("/sms-status", emergencyController.handleSmsStatus);
emergencyRoutes.get("/emergency-sms", emergencyController.getAllEmergencyMessages);
emergencyRoutes.get("/emergency-sms/phone/:phone", emergencyController.getMessagesByPhone);

module.exports = emergencyRoutes;
