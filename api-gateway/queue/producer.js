const amqp = require('amqplib');

const sendMessage = async (queue, message) => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(message));
        console.log(`Message sent to queue "${queue}":`, message);
        await channel.close();
        await connection.close();
    } catch (err) {
        console.error('RabbitMQ error:', err);
    }
};

module.exports = sendMessage;
