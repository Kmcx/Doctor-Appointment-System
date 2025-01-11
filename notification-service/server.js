const express = require('express');
const dotenv = require('dotenv');
const startConsumer = require('./queue/consumer');

dotenv.config()

const app = express();

// Start RabbitMQ consumer
startConsumer();

app.get('/', (req, res) => {
    res.send('Notification Service is running');
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Notification Service running on port ${PORT}`));
