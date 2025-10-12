// server.js — BarkBacks backend entry point

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Story = require('./models/Story'); // MongoDB model for BarkBacks

const app = express();
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Middleware
app.use(cors()); // Allow frontend access from Vercel
app.use(express.json()); // Parse incoming JSON

// ✅ MongoDB Connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('✅ Connected to MongoDB Atlas');
});

// ✅ Debug route for frontend heartbeat
app.get('/api/test-db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ message: 'Connected to MongoDB' });
  } catch (err) {
    res.status(500).json({ message: 'MongoDB ping failed', error: err.message });
  }
});

// ✅ BarkBack story submission route
app.post('/api/create-story', async (req, res) => {
  try {
    const { petName, emotion, storyText } = req.body;

    const newStory = new Story({ petName, emotion, storyText });
    await newStory.save();

    res.status(201).json({ message: 'Story saved!', story: newStory });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save story', error: err.message });
  }
});

// ✅ Root route
app.get('/', (req, res) => {
  res.send('🐾 BarkBacks backend is running');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 BarkBacks backend running on port ${PORT}`);
});
