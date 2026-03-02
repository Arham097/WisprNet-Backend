const { Twilio } = require("twilio");

const client = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Convert a local Pakistani number (03xx) to E.164 (+92xx).
 * Already E.164 numbers are returned as-is.
 */
const toE164 = (number) => {
  const cleaned = String(number).trim();
  if (cleaned.startsWith("+")) return cleaned;          // already E.164
  if (cleaned.startsWith("0")) return "+92" + cleaned.slice(1); // 0300 → +92300
  return "+" + cleaned;
};

/**
 * Sleep helper for exponential back-off.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Send an emergency SMS via Twilio with:
 *   • Retry logic  (up to MAX_RETRIES attempts)
 *   • Exponential back-off between retries
 *   • Status-callback webhook support
 *
 * @param {string} from      - Sender number (mesh / local format)
 * @param {string} to        - Recipient number (mesh / local format)
 * @param {string} content   - Message body
 * @param {number} [retries] - Override default retry count (optional)
 * @returns {object}         - Twilio message object
 */
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000; // 1 s → 2 s → 4 s

const sendSms = async (from, to, content, retries = MAX_RETRIES) => {
  const recipient = toE164(to);
  const body = `Emergency Alert from ${from}: ${content}`;

  let lastError;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const message = await client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: recipient,
        statusCallback: process.env.SMS_STATUS_CALLBACK_URL || undefined,
      });

      console.log(
        `[TwilioSmsService] SMS sent on attempt ${attempt + 1}. SID: ${message.sid}`
      );
      return message;
    } catch (error) {
      lastError = error;
      console.error(
        `[TwilioSmsService] Attempt ${attempt + 1} failed:`,
        error.message
      );

      if (attempt < retries - 1) {
        const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt); // 1s, 2s, 4s …
        console.log(`[TwilioSmsService] Retrying in ${backoff}ms …`);
        await sleep(backoff);
      }
    }
  }

  throw lastError; // all retries exhausted
};

module.exports = { sendSms, toE164 };

