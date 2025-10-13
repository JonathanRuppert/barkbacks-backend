// Story.js — BarkBacks story schema

const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  petId: {
    type: String,
    required: true,
  },
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
    required: true,
  },
  creatorId: {
    type: String,
    required: true,
  },
  remixOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Story', StorySchema);
