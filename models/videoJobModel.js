const mongoose = require('mongoose');

const videoJobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true, // Original job ID for tracking
  },
  veoTaskId: {
    type: String,
    default: '', // VEO's task ID (if different from jobId)
  },
  daycareId: {
    type: String,
    required: true,
    index: true, // Index for faster queries by daycare
  },
  petName: {
    type: String,
    required: true,
  },
  breed: {
    type: String,
    required: true,
  },
  photoUrl: {
    type: String,
    default: '',
  },
  emotion: {
    type: String,
    required: true,
  },
  createdVia: {
    type: String,
    enum: ['daycare_dashboard', 'customer_portal'],
    default: 'daycare_dashboard',
  },
  daycare_activities: {
    type: [String],
    default: [],
  },
  number_of_dogs: {
    type: Number,
    default: 1,
    min: 1,
    max: 2,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'complete', 'failed'],
    default: 'pending',
  },
  videoUrl: {
    type: String,
    default: '',
  },
  transcript: {
    type: String,
    default: '',
  },
  errorMessage: {
    type: String,
    default: '',
  },
  brandingConfig: {
    logoUrl: String,
    brandColor: String,
    daycareName: String,
  },
  // Metadata from workflow
  breedData: {
    breedId: String,
    breedName: String,
    imageUrl: String,
    voiceId: String,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Index for efficient status queries
videoJobSchema.index({ status: 1, createdAt: -1 });

// Index for daycare-specific queries
videoJobSchema.index({ daycareId: 1, createdAt: -1 });

const VideoJob = mongoose.model('VideoJob', videoJobSchema);

module.exports = VideoJob;
