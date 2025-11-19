const jwt = require('jsonwebtoken');
const Daycare = require('../models/daycareModel');
const Customer = require('../models/customerModel');

// Middleware to verify JWT token for daycare
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided. Authorization denied.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'barkbacks-secret-key-change-in-production');

    // Get daycare from database
    const daycare = await Daycare.findById(decoded.id).select('-password');

    if (!daycare) {
      return res.status(401).json({ error: 'Token is not valid. Daycare not found.' });
    }

    if (!daycare.isActive) {
      return res.status(403).json({ error: 'Account is inactive. Please contact support.' });
    }

    // Attach daycare to request object
    req.daycare = daycare;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token is not valid.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired.' });
    }
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Server error during authentication.' });
  }
};

// Middleware to verify JWT token for customer
const authenticateCustomer = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required. Please log in.',
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find customer by ID from token
    const customer = await Customer.findById(decoded.customerId);

    if (!customer) {
      return res.status(401).json({
        error: 'Invalid authentication token.',
      });
    }

    // Attach customer to request object
    req.customer = customer;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid authentication token.',
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Authentication token has expired. Please log in again.',
      });
    }
    console.error('Customer auth middleware error:', err);
    res.status(500).json({
      error: 'Authentication failed.',
    });
  }
};

module.exports = { authMiddleware, authenticateCustomer };
