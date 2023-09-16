const mongoose = require('mongoose');

// Define the Contact Schema
const contactSchema = new mongoose.Schema(
  {
    ContactName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email addresses are unique
    },
    phone: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// Create a model from the schema
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
