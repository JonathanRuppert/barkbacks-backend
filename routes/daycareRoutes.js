const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Customer = require('../models/customerModel');
const Payment = require('../models/paymentModel');
const VideoJob = require('../models/videoJobModel');
const Daycare = require('../models/daycareModel');
const { authMiddleware } = require('../middleware/authMiddleware');

// Generate JWT token for daycare
const generateToken = (daycareId, daycareDbId) => {
  return jwt.sign(
    { daycareId, id: daycareDbId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// POST /api/daycare/register - Public endpoint for daycare self-registration
router.post('/register', async (req, res) => {
  try {
    const { daycareName, email, password, phone, address } = req.body;

    // Validation
    if (!daycareName || !email || !password) {
      return res.status(400).json({
        error: 'Please provide daycare name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long',
      });
    }

    // Check if daycare already exists
    const existingDaycare = await Daycare.findOne({ email: email.toLowerCase() });
    if (existingDaycare) {
      return res.status(400).json({
        error: 'An account with this email already exists',
      });
    }

    // Create new daycare
    const daycare = new Daycare({
      daycareName,
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save hook
      subscription: {
        plan: 'free',
        videosPerMonth: 10,
        videosUsedThisMonth: 0,
      },
    });

    await daycare.save();

    // Generate token
    const token = generateToken(daycare.daycareId, daycare._id);

    console.log(`✅ New daycare registered: ${daycare.daycareName} (${daycare.email})`);

    res.status(201).json({
      message: 'Registration successful! Welcome to BarkBacks.',
      daycare: {
        id: daycare._id,
        daycareId: daycare.daycareId,
        daycareName: daycare.daycareName,
        email: daycare.email,
        subscription: daycare.subscription,
      },
      token,
    });
  } catch (error) {
    console.error('Daycare registration error:', error);
    res.status(500).json({
      error: 'Registration failed. Please try again.',
    });
  }
});

// GET /api/daycare/customers - Get list of customers who used this daycare's portal
router.get('/customers', authMiddleware, async (req, res) => {
  try {
    const daycareId = req.user.daycareId;

    // Find all payments for this daycare
    const payments = await Payment.find({
      daycareId: daycareId,
    }).populate('customerId').sort({ createdAt: -1 });

    // Group by customer and aggregate their data
    const customerMap = new Map();

    for (const payment of payments) {
      if (!payment.customerId) continue;

      const customerId = payment.customerId._id.toString();

      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: payment.customerId._id,
          name: payment.customerId.name,
          email: payment.customerId.email,
          phone: payment.customerId.phone || '',
          joinedDate: payment.customerId.createdAt,
          totalSpent: 0,
          totalVideos: 0,
          creditsRemaining: 0,
          lastPurchase: payment.createdAt,
          purchases: [],
        });
      }

      const customer = customerMap.get(customerId);
      customer.totalSpent += payment.amount;
      customer.totalVideos += payment.videosUsed;
      customer.creditsRemaining += (payment.videosRemaining - payment.videosUsed);

      if (payment.createdAt > customer.lastPurchase) {
        customer.lastPurchase = payment.createdAt;
      }

      customer.purchases.push({
        date: payment.createdAt,
        amount: payment.amount,
        productType: payment.productType,
        creditsPurchased: payment.videosRemaining,
        creditsUsed: payment.videosUsed,
      });
    }

    const customers = Array.from(customerMap.values());

    res.status(200).json({
      customers: customers,
      total: customers.length,
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      error: 'Failed to get customers.',
    });
  }
});

// GET /api/daycare/analytics - Get analytics and metrics for this daycare
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const daycareId = req.user.daycareId;

    // Get all payments for this daycare
    const payments = await Payment.find({
      daycareId: daycareId,
      status: 'completed',
    });

    // Get all video jobs for this daycare
    const videoJobs = await VideoJob.find({
      daycareId: daycareId,
    });

    // Calculate metrics
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalVideosPurchased = payments.reduce((sum, p) => sum + p.videosRemaining, 0);
    const totalVideosCreated = payments.reduce((sum, p) => sum + p.videosUsed, 0);
    const creditsRemaining = totalVideosPurchased - totalVideosCreated;

    // Get unique customers
    const uniqueCustomers = new Set(payments.map(p => p.customerId?.toString()).filter(Boolean));
    const totalCustomers = uniqueCustomers.size;

    // Get video status breakdown
    const videosByStatus = {
      completed: videoJobs.filter(v => v.status === 'complete').length,
      processing: videoJobs.filter(v => v.status === 'processing').length,
      failed: videoJobs.filter(v => v.status === 'failed').length,
    };

    // Get popular products
    const productCounts = {};
    payments.forEach(p => {
      productCounts[p.productType] = (productCounts[p.productType] || 0) + 1;
    });

    // Get revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentPayments = payments.filter(p => p.createdAt >= sixMonthsAgo);
    const revenueByMonth = {};

    recentPayments.forEach(p => {
      const monthKey = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + p.amount;
    });

    // Calculate average order value
    const averageOrderValue = payments.length > 0 ? totalRevenue / payments.length : 0;

    res.status(200).json({
      overview: {
        totalRevenue: totalRevenue,
        totalCustomers: totalCustomers,
        totalVideosPurchased: totalVideosPurchased,
        totalVideosCreated: totalVideosCreated,
        creditsRemaining: creditsRemaining,
        averageOrderValue: Math.round(averageOrderValue),
      },
      videos: {
        total: videoJobs.length,
        byStatus: videosByStatus,
      },
      products: {
        popularity: productCounts,
      },
      revenue: {
        byMonth: revenueByMonth,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Failed to get analytics.',
    });
  }
});

// GET /api/daycare/customer/:customerId - Get detailed customer info
router.get('/customer/:customerId', authMiddleware, async (req, res) => {
  try {
    const daycareId = req.user.daycareId;
    const customerId = req.params.customerId;

    // Get customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get their payments for this daycare
    const payments = await Payment.find({
      customerId: customerId,
      daycareId: daycareId,
    }).sort({ createdAt: -1 });

    // Get their videos for this daycare
    const videos = await VideoJob.find({
      daycareId: daycareId,
      customerId: customerId,
    }).sort({ createdAt: -1 });

    const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalCredits = payments.reduce((sum, p) => sum + p.videosRemaining, 0);
    const usedCredits = payments.reduce((sum, p) => sum + p.videosUsed, 0);

    res.status(200).json({
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        joinedDate: customer.createdAt,
      },
      stats: {
        totalSpent: totalSpent,
        totalCredits: totalCredits,
        usedCredits: usedCredits,
        remainingCredits: totalCredits - usedCredits,
        totalVideos: videos.length,
      },
      payments: payments.map(p => ({
        id: p._id,
        date: p.createdAt,
        amount: p.amount,
        productType: p.productType,
        status: p.status,
        creditsPurchased: p.videosRemaining,
        creditsUsed: p.videosUsed,
        creditsLeft: p.videosRemaining - p.videosUsed,
      })),
      videos: videos.map(v => ({
        id: v._id,
        jobId: v.jobId,
        petName: v.petName,
        status: v.status,
        createdAt: v.createdAt,
        videoUrl: v.videoUrl,
      })),
    });
  } catch (error) {
    console.error('Get customer details error:', error);
    res.status(500).json({
      error: 'Failed to get customer details.',
    });
  }
});

module.exports = router;
