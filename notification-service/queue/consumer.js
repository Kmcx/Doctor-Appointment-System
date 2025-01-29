const amqp = require('amqplib');
const sendEmail = require('../email/emailSender'); // Email gönderici modül

const QUEUE_NAME = 'notificationQueue';

const startConsumer = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL); // RabbitMQ bağlantısı
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log(`Waiting for messages in queue: ${QUEUE_NAME}...`);

        // Kuyruktaki mesajları tüket
        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                const notification = JSON.parse(msg.content.toString());
                console.log('Processing notification:', notification);

                // E-posta gönder
                await sendEmail(notification.email, notification.subject, notification.text);

                // Mesajı işlenmiş olarak işaretle
                channel.ack(msg);
            }
        });
    } catch (err) {
        console.error('Error in RabbitMQ consumer:', err.message);
    }
};

module.exports = startConsumer;
