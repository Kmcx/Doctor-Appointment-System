const express = require('express');
const dotenv = require('dotenv');
const startConsumer = require('./queue/consumer');
const amqp = require('amqplib');

dotenv.config()

const app = express();

// Start RabbitMQ consumer
startConsumer();

// Health check route
app.get('/health', async (req, res) => {
    try {
        // Check RabbitMQ connection
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        await connection.close();

        // Check SMTP credentials
        if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
            throw new Error('Missing SMTP credentials');
        }

        res.status(200).json({ status: 'Notification Service is healthy!' });
    } catch (err) {
        console.error('Health check error:', err.message);
        res.status(500).json({ status: 'Notification Service is unhealthy', error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('Notification Service is running');
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Notification Service running on port ${PORT}`));
