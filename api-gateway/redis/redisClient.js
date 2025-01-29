const redis = require('redis');

// Redis client oluştur
const client = redis.createClient({
    socket: {
        host: '127.0.0.1', // Redis sunucu adresi (localhost varsayılan)
        port: 6379,        // Redis portu (varsayılan 6379)
    },
});

client.on('error', (err) => console.error('Redis connection error:', err));
client.on('connect', () => console.log('Connected to Redis'));

// Redis bağlantısını başlat
(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();

module.exports = client;
