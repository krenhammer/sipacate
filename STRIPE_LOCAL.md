To forward a webhook from Stripe to your local environment using the Stripe CLI, follow these steps:

1. **Install the Stripe CLI**:  
   If you haven’t already installed the Stripe CLI, download and install it for your operating system. You can find instructions on the [Stripe CLI documentation page](https://stripe.com/docs/stripe-cli). For example:
   - On macOS with Homebrew: `brew install stripe/stripe-cli/stripe`
   - On Windows with Scoop: `scoop install stripe`
   - On Linux: Follow the manual installation steps from the official docs.

2. **Log in to Stripe CLI**:  
   Run the following command to authenticate the CLI with your Stripe account:
   ```
   stripe login
   ```
   Follow the prompts to open your browser and authorize the CLI. This will link it to your Stripe account.

3. **Start Listening for Webhook Events**:  
   Use the `stripe listen` command to forward Stripe webhook events to your local server. Replace `localhost:PORT` with the address of your local webhook endpoint (e.g., `localhost:3000/webhook`):
   ```
   stripe listen --forward-to localhost:3000/webhook
   ```
   - The `--forward-to` flag specifies where the CLI should send the events.
   - After running this, the CLI will output a webhook signing secret (e.g., `whsec_xxx`). Save this secret, as you’ll need it to verify the events in your application.

4. **Test Your Webhook**:  
   In a separate terminal, you can simulate events to test your webhook endpoint. For example, to trigger a `payment_intent.succeeded` event:
   ```
   stripe trigger payment_intent.succeeded
   ```
   The CLI will forward this event to your local endpoint specified in the `listen` command.

5. **Optional Configurations**:  
   - To forward specific events only, use the `--events` flag with a comma-separated list:
     ```
     stripe listen --events payment_intent.created,payment_intent.succeeded --forward-to localhost:3000/webhook
     ```
   - If your local server doesn’t use HTTPS, you can skip certificate verification (useful for testing):
     ```
     stripe listen --skip-verify --forward-to localhost:3000/webhook
     ```
   - If you’ve already set up a webhook endpoint in the Stripe Dashboard and want to forward those events locally, use:
     ```
     stripe listen --load-from-webhooks-api --forward-to localhost:3000/webhook
     ```

6. **Verify Events in Your Application**:  
   In your server code, use the webhook signing secret (from step 3) to verify that the events are genuinely from Stripe. Most Stripe SDKs provide a method to construct and verify webhook events. For example, in Node.js:
   ```javascript
   const stripe = require('stripe')('your-secret-key');
   const endpointSecret = 'whsec_xxx'; // From the CLI output

   app.post('/webhook', (req, res) => {
     const sig = req.headers['stripe-signature'];
     let event;

     try {
       event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
     } catch (err) {
       console.log(`Webhook Error: ${err.message}`);
       return res.status(400).send(`Webhook Error: ${err.message}`);
     }

     console.log(`Received event: ${event.type}`);
     res.status(200).end();
   });
   ```
   Ensure your server preserves the raw body of the request for signature verification.

That’s it! Your Stripe webhook events should now be forwarded to your local environment for testing. Let me know if you need help with any specific part!