// server.js
const express = require('express');
const { port } = require('./config');
const contactRouter = require('./routes/contact.route');
const { connectToDatabase } = require('./db');

const app = express();

app.use(express.json());

app.use('/api/contacts', contactRouter);

app.get('/', (req, res) => {
  res.send('Message from server');
});

const startServer = () => {
  connectToDatabase();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

module.exports = { startServer };
