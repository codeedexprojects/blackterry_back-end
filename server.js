const express = require('express');
const { connectDB } = require('./config/database');
const { loadEnv } = require('./config/env');
const app = require('./src/app');

// Load environment variables
loadEnv();

// Initialize Express app
const PORT = process.env.PORT || 4000;
// Connect to MongoDB
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
