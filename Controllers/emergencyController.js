const EmergencyMessage = require("../Models/emergencyMessageModel.js");
const { sendSms } = require("../utils/TwilioSmsService.js");
const asyncErrorHandler = require("../utils/asyncErrorHandler.js");

// POST /api/emergency-sms
exports.handleEmergencySms = asyncErrorHandler(async (req, res, next) => {
  const { messageId, ttl, timestamp, from, to, content } = req.body;

  // Prevent duplicate delivery
  const existing = await EmergencyMessage.findOne({ messageId });
  if (existing) {
    return res.status(200).json({ success: false, reason: "Duplicate messageId" });
  }

  // Save to DB
  const record = await EmergencyMessage.create({
    messageId,
    fromNumber: from,
    toNumber: to,
    content,
    ttl,
    meshTimestamp: timestamp,
    status: "pending",
  });

  // Send SMS via Twilio
  const message = await sendSms(from, to, content);
  record.status = "sent";
  record.twilioSid = message.sid;
  await record.save();

  res.status(200).json({ success: true, sid: message.sid });
});

// POST /api/sms-status  (Twilio delivery webhook)
exports.handleSmsStatus = asyncErrorHandler(async (req, res, next) => {
  const { MessageSid, MessageStatus } = req.body;
  console.log(`[SMS Status] SID: ${MessageSid} | Status: ${MessageStatus}`);
  await EmergencyMessage.findOneAndUpdate({ twilioSid: MessageSid }, { status: MessageStatus });
  res.sendStatus(200);
});

// GET /api/emergency-sms
exports.getAllEmergencyMessages = asyncErrorHandler(async (req, res, next) => {
  const messages = await EmergencyMessage.find().sort({ createdAt: -1 });
  res.status(200).json({ status: "success", data: { messages } });
});

// GET /api/emergency-sms/phone/:phone
exports.getMessagesByPhone = asyncErrorHandler(async (req, res, next) => {
  const { phone } = req.params;
  const messages = await EmergencyMessage.find({
    $or: [{ fromNumber: phone }, { toNumber: phone }],
  }).sort({ createdAt: -1 });
  res.status(200).json({ status: "success", data: { messages } });
});
