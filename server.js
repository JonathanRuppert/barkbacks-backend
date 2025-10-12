// server.js — BarkBacks backend entry point

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ Initial MongoDB connection error:', err);
  });

mongoose.connection.on('connected', () => {
  console.log(`✅ Mongoose connected to DB: ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

// Test Route
app.get('/api/test-db', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.json({ message: 'Connected to MongoDB' });
  } else {
    res.status(500).json({ message: 'Not connected to MongoDB' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 BarkBacks backend running on http://localhost:${PORT}`);
});
