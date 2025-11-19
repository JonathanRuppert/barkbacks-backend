const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Payment = require('../models/paymentModel');
const Customer = require('../models/customerModel');
const { sendPaymentConfirmation } = require('../services/emailService');

// Initialize Stripe with secret key from environment
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Product configurations (price in cents)
const PRODUCTS = {
  single_video: {
    name: 'Single Video',
    price: 500, // $5.00
    credits: 1,
  },
  video_3pack: {
    name: '3-Video Pack',
    price: 1200, // $12.00 (save $3)
    credits: 3,
  },
  video_10pack: {
    name: '10-Video Pack',
    price: 3500, // $35.00 (save $15)
    credits: 10,
  },
};

// POST /api/payment/create-checkout-session
// Creates a Stripe Checkout session for payment
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { productType, daycareId, customerEmail, metadata } = req.body;

    // Validate product type
    if (!PRODUCTS[productType]) {
      return res.status(400).json({ error: 'Invalid product type' });
    }

    if (!daycareId || !customerEmail) {
      return res.status(400).json({ error: 'Missing required fields: daycareId, customerEmail' });
    }

    const product = PRODUCTS[productType];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: `Generate ${product.credits} personalized dog video${product.credits > 1 ? 's' : ''}`,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CUSTOMER_PORTAL_URL || 'http://localhost:3001'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CUSTOMER_PORTAL_URL || 'http://localhost:3001'}/payment/cancel`,
      customer_email: customerEmail,
      metadata: {
        daycareId,
        productType,
        petName: metadata?.petName || '',
        breed: metadata?.breed || '',
        emotion: metadata?.emotion || '',
      },
    });

    // Create payment record in pending status
    const payment = new Payment({
      sessionId: session.id,
      daycareId,
      customerEmail,
      productType,
      videosRemaining: product.credits,
      videosUsed: 0,
      amount: product.price,
      currency: 'usd',
      status: 'pending',
      metadata: {
        petName: metadata?.petName || '',
        breed: metadata?.breed || '',
        emotion: metadata?.emotion || '',
      },
    });

    await payment.save();

    console.log('💳 Checkout session created:', session.id);

    res.json({
      sessionId: session.id,
      url: session.url,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// GET /api/payment/verify/:sessionId
// Verifies payment status after checkout
router.get('/verify/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Find payment in database
    const payment = await Payment.findOne({ sessionId });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment status based on Stripe session
    if (session.payment_status === 'paid' && payment.status === 'pending') {
      payment.status = 'completed';
      payment.paymentIntentId = session.payment_intent;
      payment.paidAt = new Date();
      await payment.save();

      console.log('✅ Payment verified and completed:', sessionId);
    }

    res.json({
      status: payment.status,
      paymentId: payment._id,
      daycareId: payment.daycareId,
      videosRemaining: payment.videosRemaining,
      videosUsed: payment.videosUsed,
      amount: payment.amount,
      productType: payment.productType,
      paidAt: payment.paidAt,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// GET /api/payment/credits/:daycareId
// Get available credits for a daycare
router.get('/credits/:daycareId', async (req, res) => {
  try {
    const { daycareId } = req.params;

    // Find all completed payments with remaining credits
    const payments = await Payment.find({
      daycareId,
      status: 'completed',
      $expr: { $gt: ['$videosRemaining', '$videosUsed'] },
    }).sort({ paidAt: 1 }); // Oldest first (FIFO)

    const totalCredits = payments.reduce((sum, p) => sum + (p.videosRemaining - p.videosUsed), 0);

    res.json({
      totalCredits,
      payments: payments.map(p => ({
        paymentId: p._id,
        productType: p.productType,
        videosRemaining: p.videosRemaining,
        videosUsed: p.videosUsed,
        creditsLeft: p.videosRemaining - p.videosUsed,
        paidAt: p.paidAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    res.status(500).json({ error: 'Failed to fetch credits' });
  }
});

// POST /api/payment/use-credit
// Use a credit for video generation (called by video creation endpoint)
router.post('/use-credit', async (req, res) => {
  try {
    const { daycareId, jobId } = req.body;

    if (!daycareId || !jobId) {
      return res.status(400).json({ error: 'Missing daycareId or jobId' });
    }

    // Find oldest payment with available credits (FIFO)
    const payment = await Payment.findOne({
      daycareId,
      status: 'completed',
      $expr: { $gt: ['$videosRemaining', '$videosUsed'] },
    }).sort({ paidAt: 1 });

    if (!payment) {
      return res.status(402).json({ error: 'No credits available. Please purchase more videos.' });
    }

    // Use a credit
    payment.videosUsed += 1;
    payment.videoJobIds.push(jobId);
    await payment.save();

    console.log(`🎟️ Credit used for job ${jobId}. ${payment.videosRemaining - payment.videosUsed} credits remaining.`);

    res.json({
      success: true,
      paymentId: payment._id,
      creditsRemaining: payment.videosRemaining - payment.videosUsed,
    });
  } catch (error) {
    console.error('Error using credit:', error);
    res.status(500).json({ error: 'Failed to use credit' });
  }
});

// POST /api/payment/webhook
// Stripe webhook endpoint for handling payment events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Checkout session completed:', session.id);

      // Update payment status
      const payment = await Payment.findOne({ sessionId: session.id });
      if (payment && payment.status === 'pending') {
        // Find or create customer account
        let customer = await Customer.findOne({ email: payment.customerEmail.toLowerCase() });

        if (!customer) {
          // Auto-create customer account if they don't exist
          const temporaryPassword = Math.random().toString(36).substring(2, 15);
          customer = new Customer({
            email: payment.customerEmail.toLowerCase(),
            password: temporaryPassword, // Will be hashed by pre-save hook
            name: payment.metadata?.petName ? `${payment.metadata.petName}'s Owner` : 'Customer',
            phone: '',
          });
          await customer.save();
          console.log(`📝 Auto-created customer account: ${customer.email}`);
        }

        // Link payment to customer
        payment.customerId = customer._id;
        payment.status = 'completed';
        payment.paymentIntentId = session.payment_intent;
        payment.paidAt = new Date();
        await payment.save();

        // Update customer's total videos purchased
        customer.totalVideosPurchased = (customer.totalVideosPurchased || 0) + payment.videosRemaining;
        await customer.save();

        console.log(`💰 Payment marked as completed: ${payment._id} → Customer: ${customer._id}`);

        // Send payment confirmation email
        const productNames = {
          single_video: 'Single Video',
          video_3pack: '3-Video Pack',
          video_10pack: '10-Video Pack',
        };

        sendPaymentConfirmation({
          to: payment.customerEmail,
          petName: payment.metadata?.petName || 'your pet',
          packageName: productNames[payment.productType] || payment.productType,
          amount: payment.amount,
          creditsRemaining: payment.videosRemaining,
        }).catch(err => console.error('Email send error:', err));
      }
      break;

    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      console.log('❌ Payment failed:', failedIntent.id);

      // Mark payment as failed
      const failedPayment = await Payment.findOne({ paymentIntentId: failedIntent.id });
      if (failedPayment) {
        failedPayment.status = 'failed';
        await failedPayment.save();
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// GET /api/payment/history/:daycareId
// Get payment history for a daycare
router.get('/history/:daycareId', async (req, res) => {
  try {
    const { daycareId } = req.params;

    const payments = await Payment.find({ daycareId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      payments: payments.map(p => ({
        paymentId: p._id,
        productType: p.productType,
        amount: p.amount / 100, // Convert to dollars
        videosRemaining: p.videosRemaining,
        videosUsed: p.videosUsed,
        status: p.status,
        createdAt: p.createdAt,
        paidAt: p.paidAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

module.exports = router;
