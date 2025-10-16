const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  creatorId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  emotion: {
    type: String,
    required: true,
  },
  remixOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    default: null,
  },
  petName: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const Story = mongoose.model('Story', storySchema);

module.exports = Story;
