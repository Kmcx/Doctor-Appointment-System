const amqp = require('amqplib');

const sendMessage = async (queue, message) => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(queue, { durable: true });

        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        console.log(`Message sent to queue "${queue}":`, message);

        await channel.close();
        await connection.close();
    } catch (err) {
        console.error('RabbitMQ send message error:', err.message);
    }
};

module.exports = sendMessage;
