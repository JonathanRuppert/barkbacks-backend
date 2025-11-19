const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true, // Stripe Checkout Session ID
  },
  paymentIntentId: {
    type: String,
    default: '',
    index: true, // Stripe Payment Intent ID
  },
  daycareId: {
    type: String,
    required: true,
    index: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null,
    index: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    enum: ['single_video', 'video_3pack', 'video_10pack'],
    required: true,
  },
  videosRemaining: {
    type: Number,
    required: true,
    default: 1,
  },
  videosUsed: {
    type: Number,
    default: 0,
  },
  amount: {
    type: Number, // Amount in cents
    required: true,
  },
  currency: {
    type: String,
    default: 'usd',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  videoJobIds: [{
    type: String, // Array of video job IDs created with this payment
  }],
  metadata: {
    petName: String,
    breed: String,
    emotion: String,
  },
  // Payment timestamps
  paidAt: {
    type: Date,
  },
  expiresAt: {
    type: Date, // Optional: For time-limited packages (e.g., 30 days)
  },
  // Revenue tracking for BarkBacks platform
  platformFee: {
    amountCents: {
      type: Number,
      default: 0, // Platform commission in cents
    },
    percentage: {
      type: Number,
      default: 20, // Default 20% platform fee
    },
  },
  daycareRevenue: {
    type: Number,
    default: 0, // Amount daycare keeps (after platform fee) in cents
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Index for efficient queries
paymentSchema.index({ daycareId: 1, status: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Method to check if payment has available credits
paymentSchema.methods.hasCreditsRemaining = function() {
  return this.videosRemaining > this.videosUsed;
};

// Method to use a credit
paymentSchema.methods.useCredit = async function() {
  if (!this.hasCreditsRemaining()) {
    throw new Error('No credits remaining');
  }
  this.videosUsed += 1;
  return this.save();
};

// Method to calculate and set revenue split
paymentSchema.methods.calculateRevenueSplit = function(feePercentage = 20) {
  this.platformFee.percentage = feePercentage;
  this.platformFee.amountCents = Math.round(this.amount * (feePercentage / 100));
  this.daycareRevenue = this.amount - this.platformFee.amountCents;
  return this;
};

// Auto-calculate revenue split before saving completed payments
paymentSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && this.platformFee.amountCents === 0) {
    this.calculateRevenueSplit(20); // 20% platform fee
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
