const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connection open to DB:', mongoose.connection.name);
});

// Routes
const storyRoutes = require('./routes/storyRoutes');
app.use(storyRoutes);

// Server Start
app.listen(PORT, () => {
  console.log(`🚀 BarkBacks backend running on http://localhost:${PORT}`);
});
