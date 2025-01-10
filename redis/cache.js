const client = require('./redisClient');

const setCache = (key, value, duration = 3600) => {
    client.setex(key, duration, JSON.stringify(value), (err) => {
        if (err) console.error('Redis SET error:', err);
    });
};

const getCache = (key, callback) => {
    client.get(key, (err, data) => {
        if (err) console.error('Redis GET error:', err);
        callback(err, JSON.parse(data));
    });
};

module.exports = { setCache, getCache };
