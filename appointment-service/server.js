const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/appointments', require('./routes/appointments'));

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Appointment Service running on port ${PORT}`));
