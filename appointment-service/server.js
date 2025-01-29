const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
dotenv.config();
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointments');
const patientRoutes = require("./routes/patientRoutes");
const scheduleIncompleteAppointments = require('./jobs/incompleteAppointments');
const cors = require("cors");
app.use(express.json());
app.use(cors());
// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use("/api/patients", patientRoutes);

app.get('/health', (req, res) => {
    res.status(200).send('Appointment Service is healthy!');
});

app.get('/', (req, res) => {
    res.send('Appointment service is running!');
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found in Appointment Service.' });
});

scheduleIncompleteAppointments();

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Appointment Service running on port ${PORT}`));
