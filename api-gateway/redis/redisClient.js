const redis = require('redis');

// Redis client 
const client = redis.createClient({
    socket: {
        host: '127.0.0.1', 
        port: 6379,        // Redis port
    },
});

client.on('error', (err) => console.error('Redis connection error:', err));
client.on('connect', () => console.log('Connected to Redis'));

// start Redis 
(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();

module.exports = client;
