// server.js — BarkBacks backend entry point

require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Middleware
app.use(cors()); // Allow cross-origin requests (for Vercel frontend)
app.use(express.json()); // Parse incoming JSON

// ✅ MongoDB Connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('❌ Initial MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('✅ Mongoose connected to DB: barkbacks');
});

// ✅ Test Route for Frontend DebugPanel
app.get('/api/test-db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ message: 'Connected to MongoDB' });
  } catch (err) {
    res.status(500).json({ message: 'MongoDB ping failed', error: err.message });
  }
});

// ✅ Root Route
app.get('/', (req, res) => {
  res.send('🐾 BarkBacks backend is running');
});

// ✅ Start Server
app.listen(PORT, () => {
  console