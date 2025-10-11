const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.set('strictQuery', false); // Optional but recommended for compatibility
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
const storyRoutes = require('./routes/storyRoutes');
app.use(storyRoutes);

// Server Start
app.listen(PORT, () => {
  console.log(`BarkBacks backend running on http://localhost:${PORT}`);
});
