import { Response } from 'express';
import Stripe from 'stripe';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
});

export const createPaymentIntent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, goalId, goalTitle } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: 'Invalid amount.' });
      return;
    }

    // TEST MODE — always simulated
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: 'usd',
      metadata: {
        userId: req.userId!,
        goalId: goalId || '',
        goalTitle: goalTitle || '',
        mode: 'TEST_MODE',
      },
      description: `TEST MODE: FocusForge commitment for "${goalTitle}"`,
    });

    await Transaction.create({
      userId: req.userId,
      goalId,
      amount,
      type: 'commitment',
      status: 'simulated',
      stripePaymentIntentId: paymentIntent.id,
      description: `TEST MODE: Simulated commitment — ${goalTitle}`,
      isTestMode: true,
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      testMode: true,
      message: 'TEST MODE — No real money will be charged.',
    });
  } catch (err) {
    console.error('Stripe error:', err);
    // Fallback simulation without Stripe
    const simulated = {
      id: `pi_test_${Date.now()}`,
      client_secret: `pi_test_${Date.now()}_secret_simulated`,
    };

    res.json({
      success: true,
      clientSecret: simulated.client_secret,
      paymentIntentId: simulated.id,
      testMode: true,
      simulated: true,
      message: 'TEST MODE — Simulated transaction (Stripe not configured).',
    });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate('goalId', 'title category');
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
