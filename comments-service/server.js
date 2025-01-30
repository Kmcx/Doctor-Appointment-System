const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // CORS 
const amqp = require('amqplib');
dotenv.config();

const commentsRoutes = require('./routes/comments');

const app = express();
app.use(express.json());
app.use(cors()); // CORS Middleware 

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send('Comment service is running!');
});

// Routes
app.use('/api/comments', commentsRoutes);

app.get('/health', async (req, res) => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        await connection.close();
        res.status(200).json({ status: 'Comments Service is healthy!' });
    } catch (err) {
        console.error('RabbitMQ connection error:', err.message);
        res.status(500).json({ status: 'Comments Service is unhealthy (RabbitMQ issue).' });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Comments Service running on port ${PORT}`));
