# SMS Strategy Pattern

A loosely-coupled SMS subsystem that lets you swap messaging providers (Twilio, Vonage, MessageBird, etc.) without touching controller or route code.

## Architecture

```
utils/sms/
  SmsStrategy.js        — Abstract base class (interface contract)
  TwilioStrategy.js     — Concrete Twilio implementation
  SmsServiceFactory.js  — Factory that resolves the active provider at runtime
  README.md             — You are here
```

## Flow

```
Request → emergencyController
               │
               ▼
        SmsServiceFactory.create()
               │  reads SMS_PROVIDER env var
               ▼
        ┌─────────────┐
        │ SmsStrategy  │  (abstract)
        └──────┬──────┘
               │
       ┌───────┴────────┐
       ▼                ▼
 TwilioStrategy    YourStrategy …
```

1. **Controller** calls `SmsServiceFactory.create()` once at startup, which returns a concrete strategy instance based on the `SMS_PROVIDER` environment variable (defaults to `"twilio"`).
2. When an emergency SMS request arrives, the controller calls `smsService.sendSms(from, to, content)` — it has no knowledge of which provider is behind that call.
3. The **concrete strategy** (e.g. `TwilioStrategy`) handles provider-specific logic: authentication, payload formatting, retries, etc.
4. The strategy returns an object with at least a `sid` property so the controller can track the message.

## Configuration

Add to your `.env`:

```env
SMS_PROVIDER=twilio          # or vonage, messagebird, etc.

# Twilio-specific
TWILIO_ACCOUNT_SID=ACxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
SMS_STATUS_CALLBACK_URL=https://yourdomain.com/api/sms-status
```

If `SMS_PROVIDER` is not set, the factory defaults to `twilio`.

## How to Add a New SMS Provider

### 1. Create the strategy file

Create `utils/sms/YourProviderStrategy.js`:

```js
const SmsStrategy = require("./SmsStrategy");

class YourProviderStrategy extends SmsStrategy {
  constructor() {
    super();
    // Initialise your provider's SDK / client here
    // e.g. this.client = new YourSDK(process.env.YOUR_API_KEY);
  }

  /**
   * @param {string} from    - Sender identifier
   * @param {string} to      - Recipient phone number
   * @param {string} content - Message body
   * @returns {Promise<{ sid: string }>}
   */
  async sendSms(from, to, content) {
    // Provider-specific send logic (retries, formatting, etc.)
    const result = await this.client.send({ from, to, body: content });
    return { sid: result.id }; // normalise to { sid }
  }
}

module.exports = YourProviderStrategy;
```

**Key rules:**
- Extend `SmsStrategy`.
- Implement `sendSms(from, to, content)`.
- Return an object with at least `{ sid: string }`.

### 2. Register it in the factory

Open `SmsServiceFactory.js` and add one line to the `strategies` map:

```js
static strategies = {
  twilio:       () => new (require("./TwilioStrategy"))(),
  yourprovider: () => new (require("./YourProviderStrategy"))(),  // ← add this
};
```

### 3. Set the environment variable

```env
SMS_PROVIDER=yourprovider
```

That's it — no controller, route, or middleware changes required.

## API Contract

Every strategy must satisfy this interface:

| Method | Params | Returns |
|--------|--------|---------|
| `sendSms(from, to, content)` | `from`: string, `to`: string, `content`: string | `Promise<{ sid: string }>` |

The `sid` is stored in the database and used by the `/api/sms-status` webhook to track delivery status.
