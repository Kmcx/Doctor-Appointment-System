const express = require('express');
const Appointment = require('../models/Appointment');
const sendMessage = require('../queue/producer');

const router = express.Router();

// Book an appointment
router.post('/', async (req, res) => {
    const { doctorId, patientId, date, time, email } = req.body;

    try {
        const newAppointment = new Appointment({ doctorId, patientId, date, time });
        await newAppointment.save();

        // Notify the patient about the booking
        const notification = {
            email,
            subject: 'Appointment Confirmation',
            text: `Your appointment with the doctor has been booked for ${date} at ${time}.`,
        };
        await sendMessage('notificationQueue', notification);

        res.status(201).json({ message: 'Appointment booked and notification sent.', appointment: newAppointment });
    } catch (err) {
        console.error('Error booking appointment:', err.message);
        res.status(500).json({ error: 'Failed to book appointment.' });
    }
});


// Notify patient of incomplete booking
router.post('/incomplete', async (req, res) => {
    const { email, appointmentId } = req.body;

    try {
        const notification = {
            email,
            subject: 'Complete Your Appointment',
            text: `You started booking an appointment but didn't finish. Please complete it to confirm.`,
        };
        await sendMessage('notificationQueue', notification);

        res.status(200).json({ message: 'Notification sent for incomplete booking.' });
    } catch (err) {
        console.error('Error sending notification:', err.message);
        res.status(500).json({ error: 'Failed to send notification.' });
    }
});

// Fetch appointments for a doctor
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctorId: req.params.doctorId });
        res.status(200).json(appointments);
    } catch (err) {
        console.error('Error fetching appointments:', err.message);
        res.status(500).json({ error: 'Failed to fetch appointments.' });
    }
});

module.exports = router;
