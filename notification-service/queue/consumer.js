const amqp = require('amqplib');
const sendEmail = require('../email/emailSender');

const QUEUE_NAME = 'notificationQueue';

const startConsumer = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        console.log(`Waiting for messages in queue "${QUEUE_NAME}"...`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                const message = JSON.parse(msg.content.toString());
                console.log('Received message:', message);

                // Send an email notification
                const { email, subject, text } = message;
                await sendEmail(email, subject, text);

                // Acknowledge the message
                channel.ack(msg);
            }
        });
    } catch (err) {
        console.error('Error in RabbitMQ Consumer:', err.message);
    }
};

module.exports = startConsumer;
