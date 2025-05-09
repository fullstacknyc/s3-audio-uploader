import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, currency, success_url, cancel_url } = req.body;

  // Validate amount
  const validAmounts = [500, 1000, 2000]; // Example: $5, $10, $20
  if (!validAmounts.includes(amount)) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  // Validate currency
  const validCurrencies = ['usd'];
  if (!validCurrencies.includes(currency)) {
    return res.status(400).json({ error: 'Invalid currency' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: 'Your Product Name', // Replace with your product name
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url || 'https://www.s3-audio-uploader.vercel.app/payment-success',
      cancel_url: cancel_url || 'https://www.s3-audio-uploader.vercel.app/payment-cancel',
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal server error' });
}
}
