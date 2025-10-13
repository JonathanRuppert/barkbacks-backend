// storyModel.js — Mongoose schema for BarkBacks stories

const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  creatorId: {
    type: String,
    required: true,
  },
  petId: {
    type: String,
    required: true,
  },
  storyText: {
    type: String,
    required: true,
  },
  emotion: {
    type: String,
    required: true,
    enum: ['Joy', 'Gratitude', 'Wonder', 'Hope', 'Nostalgia', 'Love'],
  },
  season: {
    type: String,
    enum: ['Spring', 'Summer', 'Autumn', 'Winter'],
  },
  remixOf: {
    type: String, // references original story ID
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Story', storySchema);
