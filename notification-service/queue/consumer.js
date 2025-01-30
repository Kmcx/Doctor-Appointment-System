const amqp = require('amqplib');
const sendEmail = require('../email/emailSender'); // Email sender

const QUEUE_NAME = 'notificationQueue';

const startConsumer = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL); // RabbitMQ connection
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log(`Waiting for messages in queue: ${QUEUE_NAME}...`);

        // consume queue
        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                const notification = JSON.parse(msg.content.toString());
                console.log('Processing notification:', notification);

                // send email
                await sendEmail(notification.email, notification.subject, notification.text);

                
                channel.ack(msg);
            }
        });
    } catch (err) {
        console.error('Error in RabbitMQ consumer:', err.message);
    }
};

module.exports = startConsumer;
