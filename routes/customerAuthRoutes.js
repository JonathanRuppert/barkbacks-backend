const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Customer = require('../models/customerModel');
const Payment = require('../models/paymentModel');
const { authenticateCustomer } = require('../middleware/authMiddleware');

// Generate JWT token
const generateToken = (customerId) => {
  return jwt.sign(
    { customerId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' } // Token expires in 30 days
  );
};

// POST /api/customer/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Please provide email, password, and name',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long',
      });
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return res.status(400).json({
        error: 'An account with this email already exists',
      });
    }

    // Create new customer
    const customer = new Customer({
      email: email.toLowerCase(),
      password, // Will be hashed by the pre-save hook
      name,
      phone: phone || '',
    });

    await customer.save();

    // Generate token
    const token = generateToken(customer._id);

    console.log(`✅ New customer registered: ${customer.email}`);

    res.status(201).json({
      message: 'Registration successful',
      customer: customer.toJSON(), // toJSON() method removes sensitive fields
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed. Please try again.',
    });
  }
});

// POST /api/customer/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Please provide email and password',
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordCorrect = await customer.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(customer._id);

    console.log(`✅ Customer logged in: ${customer.email}`);

    res.status(200).json({
      message: 'Login successful',
      customer: customer.toJSON(),
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed. Please try again.',
    });
  }
});

// GET /api/customer/auth/profile - Get current customer profile (protected)
router.get('/profile', authenticateCustomer, async (req, res) => {
  try {
    // req.customer is set by authenticateCustomer middleware
    res.status(200).json({
      customer: req.customer.toJSON(),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile.',
    });
  }
});

// GET /api/customer/auth/payments - Get customer's payment history (protected)
router.get('/payments', authenticateCustomer, async (req, res) => {
  try {
    // Find all payments for this customer
    const payments = await Payment.find({
      customerId: req.customer._id,
    }).sort({ createdAt: -1 });

    // Calculate total credits
    const totalCredits = payments.reduce((sum, p) => sum + p.videosRemaining, 0);
    const usedCredits = payments.reduce((sum, p) => sum + p.videosUsed, 0);
    const availableCredits = totalCredits - usedCredits;

    res.status(200).json({
      payments: payments.map(p => ({
        id: p._id,
        productType: p.productType,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        videosRemaining: p.videosRemaining,
        videosUsed: p.videosUsed,
        creditsLeft: p.videosRemaining - p.videosUsed,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
      summary: {
        totalPurchased: totalCredits,
        totalUsed: usedCredits,
        available: availableCredits,
      },
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      error: 'Failed to get payment history.',
    });
  }
});

// PUT /api/customer/auth/profile - Update customer profile (protected)
router.put('/profile', authenticateCustomer, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        error: 'Name and email are required',
      });
    }

    // Check if email is being changed and if it's already taken
    if (email.toLowerCase() !== req.customer.email) {
      const existingCustomer = await Customer.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.customer._id } // Exclude current customer
      });

      if (existingCustomer) {
        return res.status(400).json({
          error: 'This email is already in use',
        });
      }
    }

    // Update customer
    req.customer.name = name;
    req.customer.email = email.toLowerCase();
    req.customer.phone = phone || '';

    await req.customer.save();

    console.log(`✅ Customer profile updated: ${req.customer.email}`);

    res.status(200).json({
      message: 'Profile updated successfully',
      customer: req.customer.toJSON(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile.',
    });
  }
});

// PUT /api/customer/auth/change-password - Change customer password (protected)
router.put('/change-password', authenticateCustomer, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters long',
      });
    }

    // Verify current password
    const isPasswordCorrect = await req.customer.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        error: 'Current password is incorrect',
      });
    }

    // Update password
    req.customer.password = newPassword; // Will be hashed by pre-save hook
    await req.customer.save();

    console.log(`✅ Password changed for customer: ${req.customer.email}`);

    res.status(200).json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password.',
    });
  }
});

module.exports = router;
