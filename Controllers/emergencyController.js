const EmergencyMessage = require("../Models/emergencyMessageModel.js");
const SmsServiceFactory = require("../utils/sms/SmsServiceFactory.js");
const asyncErrorHandler = require("../utils/asyncErrorHandler.js");

// Resolve the SMS strategy once at startup (driven by SMS_PROVIDER env var)
const smsService = SmsServiceFactory.create();

// POST /api/emergency-sms
exports.handleEmergencySms = asyncErrorHandler(async (req, res, next) => {
  const data  = req.body;
  console.log(data)
  
  //make generator function to generate unique messageId
  const messageId = `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const from = data.message.from.phone;
  const to = data.message.to.phone;
  const content = data.message.text;

  // Save to DB
  const record = await EmergencyMessage.create({
    messageId: messageId,
    fromNumber: from,
    toNumber: to,
    content: content,
    ttl:80000,
    meshTimestamp: data.message.timestamp,
    status: "pending",
  });

  // Send SMS via the configured provider (Strategy Pattern)
  const message = await smsService.sendSms(from, to, content);
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
  res.status(200).json({ success: true });
});

// GET /api/emergency-sms
exports.getAllEmergencyMessages = asyncErrorHandler(async (req, res, next) => {
  const messages = await EmergencyMessage.find().sort({ createdAt: -1 });
  res.status(200).json({ status: "success", data: { messages } });
});

// GET /api/emergency-sms/phone/:phone
exports.getMessagesByPhone = asyncErrorHandler(async (req, res, next) => {
  console.log("Fetching messages for phone:", req.params.phone);
  const { phone } = req.params;
  const messages = await EmergencyMessage.find({
    $or: [{ fromNumber: phone }, { toNumber: phone }],
  }).sort({ createdAt: -1 });
  res.status(200).json({ status: "success", data: { messages } });
});
