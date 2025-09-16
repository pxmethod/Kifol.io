import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from './config';

// Initialize Stripe on the client side
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Helper function to get Stripe instance
export const getStripe = () => stripePromise;
