const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Load route modules
const promptRoutes = require('./routes/promptRoutes');
const imageRoutes = require('./routes/imageRoutes');
const animateRoutes = require('./routes/animateRoutes');
const submitRoutes = require('./routes/submitRoutes');
const renderRoutes = require('./routes/renderRoutes');
const creatorRoutes = require('./routes/creatorRoutes');
const storyRoutes = require('./routes/storyRoutes');

// Mount routes
app.use('/', promptRoutes);
app.use('/', imageRoutes);
app.use('/', animateRoutes);
app.use('/', submitRoutes);
app.use('/', renderRoutes);
app.use('/', creatorRoutes);
app.use('/', storyRoutes);

module.exports = app;
