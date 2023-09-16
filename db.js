// db.js
const mongoose = require('mongoose');
const { mongoDBURL } = require('./config');

const connectToDatabase = async () => {
  try {
    await mongoose.connect(mongoDBURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

module.exports = { connectToDatabase };
