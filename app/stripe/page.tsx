import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../lib/stripe'; // Adjusted path to match the correct location
import { useEffect, useState } from 'react';
import CheckoutForm from '../components/CheckoutForm'; // Adjusted path to match the correct location

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | undefined>(undefined); // Updated type to match StripeElementsOptions

  useEffect(() => {
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 2000 }),
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, []);

  const stripePromise = getStripe();

  const options = clientSecret ? { clientSecret } : undefined; // Ensures options is undefined if clientSecret is not set

  return (
    <div>
      <h1>Checkout</h1>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}
