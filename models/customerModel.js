const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const customerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    default: '',
  },
  // Optional: Link to a default daycare they frequent
  preferredDaycareId: {
    type: String,
    default: '',
  },
  // Track video credits purchased
  totalVideosPurchased: {
    type: Number,
    default: 0,
  },
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: '',
  },
  // Password reset
  resetPasswordToken: {
    type: String,
    default: '',
  },
  resetPasswordExpires: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Hash password before saving
customerSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
customerSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Don't return password in JSON responses
customerSchema.methods.toJSON = function() {
  const customer = this.toObject();
  delete customer.password;
  delete customer.emailVerificationToken;
  delete customer.resetPasswordToken;
  delete customer.resetPasswordExpires;
  return customer;
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
