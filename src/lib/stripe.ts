import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? process.env.STRIPE_API_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2026-08-26.dahlia', // Versao exigida pelo SDK atual
      typescript: true,
    })
  : null;
