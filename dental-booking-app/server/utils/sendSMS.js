const twilio = require('twilio');

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE;

const client = twilio(accountSid, authToken);

const sendSMS = async (to, message) => {
  try {
    await client.messages.create({
      body: message,
      from: fromNumber,
      to: to
    });
    console.log('✅ SMS sent to', to);
  } catch (err) {
    console.error('❌ Failed to send SMS:', err);
  }
};

module.exports = sendSMS;
