const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  id: { type: String, required: true },
  prompt: { type: String, required: true },
  image: { type: String, required: true },
  animation: { type: String, required: true },
  tags: [String],
  remixedFrom: String,
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);
