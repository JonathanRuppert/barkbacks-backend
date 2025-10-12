// models/Story.js — MongoDB schema for BarkBacks

const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  petName: { type: String, required: true },
  emotion: { type: String, required: true },
  storyText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Story', storySchema);
