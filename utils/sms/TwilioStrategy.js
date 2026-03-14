const { Twilio } = require("twilio");
const SmsStrategy = require("./SmsStrategy");

const toE164 = (number) => {
  const cleaned = String(number).trim();
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("0")) return "+92" + cleaned.slice(1);
  return "+" + cleaned;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

/**
 * Twilio-specific implementation of SmsStrategy.
 */
class TwilioStrategy extends SmsStrategy {
  constructor() {
    super();
    this.client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  /**
   * Send an SMS via Twilio with retry + exponential back-off.
   * @param {string} from    - Sender identifier (shown in message body)
   * @param {string} to      - Recipient phone number
   * @param {string} content - Message body
   * @returns {Promise<{ sid: string }>}
   */
  async sendSms(from, to, content) {
    const recipient = toE164(to);
    const body = `Emergency Alert from ${from}: ${content}`;

    let lastError;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const message = await this.client.messages.create({
          body,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipient,
          statusCallback: process.env.SMS_STATUS_CALLBACK_URL || undefined,
        });

        console.log(
          `[TwilioStrategy] SMS sent on attempt ${attempt + 1}. SID: ${message.sid}`
        );
        return message;
      } catch (error) {
        lastError = error;
        console.error(
          `[TwilioStrategy] Attempt ${attempt + 1} failed:`,
          error.message
        );

        if (attempt < MAX_RETRIES - 1) {
          const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt);
          console.log(`[TwilioStrategy] Retrying in ${backoff}ms …`);
          await sleep(backoff);
        }
      }
    }

    throw lastError;
  }
}

module.exports = TwilioStrategy;
