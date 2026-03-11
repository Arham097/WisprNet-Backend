/**
 * SmsStrategy — abstract base class for all SMS providers.
 *
 * Every concrete strategy must implement:
 *   • sendSms(from, to, content)  → { sid: string }
 *
 * This keeps the controller de-coupled from any specific vendor SDK.
 */
class SmsStrategy {
  /**
   * Send an SMS message.
   * @param {string} from    - Sender identifier (e.g. mesh node address)
   * @param {string} to      - Recipient phone number
   * @param {string} content - Message body
   * @returns {Promise<{ sid: string }>} - Must resolve with at least a `sid`
   */
  async sendSms(from, to, content, fromName) {
    throw new Error(
      `sendSms() is not implemented. ${this.constructor.name} must override it.`
    );
  }
}

module.exports = SmsStrategy;
