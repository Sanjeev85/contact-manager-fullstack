// redisClient.js
const Redis = require('ioredis');

// Create a Redis client instance
const redisClient = new Redis({
  host: 'localhost', // Redis server hostname
  port: 6379, // Redis server port
  // Add any additional configuration options as needed
});

// Export the Redis client instance
module.exports = redisClient;
