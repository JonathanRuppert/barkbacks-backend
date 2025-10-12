// Story.js — MongoDB schema for BarkBacks

const mongoose = require('mongoose');

// 🧬 Define the schema for each BarkBack story
const storySchema = new mongoose.Schema({
  petName: {
    type: String,
    required: true, // Pet name is mandatory
  },
  emotion: {
    type: String,
    required: true, // Emotion tag is mandatory
  },
  storyText: {
    type: String,
    required: true, // Story content is mandatory
  },
  season: {
    type: String,
    default: '', // Automatically set based on submission date
  },
  createdAt: {
    type: Date,
    default: Date.now, // Timestamp of when the story was submitted
  },
});

// 🧠 Export the model so it can be used in server.js
module.exports = mongoose.model('Story', storySchema);