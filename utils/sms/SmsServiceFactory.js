const TwilioStrategy = require("./TwilioStrategy");

/**
 * SmsServiceFactory — returns the correct SmsStrategy instance
 * based on the SMS_PROVIDER environment variable (or a manual override).
 *
 * Usage:
 *   const smsService = SmsServiceFactory.create();          // reads SMS_PROVIDER env
 *   const smsService = SmsServiceFactory.create("twilio");  // explicit
 *
 * To add a new provider:
 *   1. Create  utils/sms/YourProviderStrategy.js  extending SmsStrategy
 *   2. Register it in the `strategies` map below
 *   3. Set  SMS_PROVIDER=yourprovider  in .env
 */
class SmsServiceFactory {
  static strategies = {
    twilio: () => new TwilioStrategy(),
  };

  /**
   * Create and return an SmsStrategy instance.
   * @param {string} [provider] - Provider key. Defaults to process.env.SMS_PROVIDER || "twilio"
   * @returns {import("./SmsStrategy")} concrete strategy instance
   */
  static create(provider) {
    const key = (provider || process.env.SMS_PROVIDER || "twilio").toLowerCase();
    const factory = SmsServiceFactory.strategies[key];

    if (!factory) {
      throw new Error(
        `Unknown SMS provider "${key}". ` +
        `Registered providers: ${Object.keys(SmsServiceFactory.strategies).join(", ")}`
      );
    }

    return factory();
  }
}

module.exports = SmsServiceFactory;
