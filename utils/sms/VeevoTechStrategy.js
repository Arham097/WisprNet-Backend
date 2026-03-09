const axios = require("axios");
const SmsStrategy = require("./SmsStrategy");

const VEEVOTECH_API_URL = "https://api.veevotech.com/v3/sendsms";

/**
 * Convert a local Pakistani number (03xx) to international format (923xx).
 * VeevoTech expects numbers WITHOUT a leading '+'.
 * Already international numbers (starting with digits, no '+') are returned as-is.
 */
const toVeevoFormat = (number) => {
  const cleaned = String(number).trim();
  if (cleaned.startsWith("+")) return cleaned.slice(1);        // +923001234567 → 923001234567
  if (cleaned.startsWith("0")) return "92" + cleaned.slice(1); // 03001234567  → 923001234567
  return cleaned;
};

// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// const MAX_RETRIES = 3;
// const BASE_BACKOFF_MS = 1000;

/**
 * VeevoTech-specific implementation of SmsStrategy.
 *
 * Endpoint : POST https://api.veevotech.com/v3/sendsms
 * Body     : { hash, receivernum, sendernum, textmessage }
 */
class VeevoTechStrategy extends SmsStrategy {
  constructor() {
    super();
    this.apiKey = process.env.VEEVOTECH_API_KEY;
  }

  /**
   * Send an SMS via VeevoTech API (single attempt).
   * @param {string} from    - Sender's phone number (the customer/mesh node originating the message)
   * @param {string} to      - Recipient phone number
   * @param {string} content - Message body
   * @returns {Promise<{ sid: string }>}
   */
  async sendSms(from, to, content) {
    const sendernum = toVeevoFormat(from);
    const receivernum = toVeevoFormat(to);
    const textmessage = `From : ${sendernum} \n${content}`;

    const response = await axios.post(VEEVOTECH_API_URL, {
      hash: this.apiKey,
      receivernum,
      sendernum,
      textmessage,
    });

    const data = response.data;

    // VeevoTech returns STATUS="SUCCESSFUL" on success
    const status = String(data.STATUS || "").toLowerCase();
    if (status !== "successful" && status !== "success" && status !== "1") {
      throw new Error(
        `VeevoTech API error: STATUS=${data.STATUS}, DETAILS=${JSON.stringify(data)}`
      );
    }

    // Normalise the response to match the { sid } shape the rest of the app expects
    const sid = data.MESSAGE_ID || data.MSGID || data.msgid || `veevo_${Date.now()}`;

    console.log(`[VeevoTechStrategy] SMS sent successfully. SID: ${sid}`);

    return { sid, raw: data };

    // --- Retry logic (commented out for now) ---
    // let lastError;
    // for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    //   try {
    //     ... (same request) ...
    //     return { sid, raw: data };
    //   } catch (error) {
    //     lastError = error;
    //     if (attempt < MAX_RETRIES - 1) {
    //       const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt);
    //       await sleep(backoff);
    //     }
    //   }
    // }
    // throw lastError;
  }
}

module.exports = VeevoTechStrategy;

