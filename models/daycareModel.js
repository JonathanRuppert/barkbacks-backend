const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const daycareSchema = new mongoose.Schema({
  daycareName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  daycareId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple nulls during creation
  },
  brandingConfig: {
    logoUrl: {
      type: String,
      default: '',
    },
    brandColor: {
      type: String,
      default: '#FF6B35', // Default BarkBacks orange
    },
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: 'free',
    },
    videosPerMonth: {
      type: Number,
      default: 10, // Free plan limit
    },
    videosUsedThisMonth: {
      type: Number,
      default: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Hash password before saving
daycareSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
daycareSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate unique daycareId before validation
daycareSchema.pre('validate', function(next) {
  if (!this.daycareId) {
    this.daycareId = `daycare_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

const Daycare = mongoose.model('Daycare', daycareSchema);

module.exports = Daycare;
