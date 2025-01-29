const redis = require('redis');
const client = redis.createClient();

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('Connected to Redis'));

// Ensure the client connects when the module is imported
(async () => {
    try {
        await client.connect();
        console.log('Redis client connected');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();

module.exports = client;
