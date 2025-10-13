// Story.js — MongoDB schema for BarkBacks

const mongoose = require('mongoose');

// 🧬 Define the schema for each BarkBack story
const storySchema = new mongoose.Schema({
  petName: {
    type: String,
    required: true,
  },
  emotion: {
    type: String,
    required: true,
  },
  storyText: {
    type: String,
    required: true,
  },
  season: {
    type: String,
    default: '',
  },
  creatorId: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Story', storySchema);
