const logger = require("../utils/logger");

const sendSMS = async ({ phone, message }) => {
  // 🔴 Replace later with Twilio / Fast2SMS / AWS SNS
  logger.info(`📲 SMS to ${phone}: ${message}`);
};

module.exports = { sendSMS };
