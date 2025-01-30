const express = require('express');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const sendMessage = require('../queue/producer'); // RabbitMQ queue
const client = require('../redisClient'); // Redis cache

const router = express.Router();

// 1. Randevu oluşturma
router.post('/', async (req, res) => {
    console.log('POST /appointments called with body:', req.body);
    const { doctorId, patientId, date, time, email } = req.body;

    try {
        
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found.' });
        }

        // create appointment
        const newAppointment = new Appointment({
            doctorId,
            patientId,
            date,
            time,
        });
        await newAppointment.save();

        // clear redis cache
        await client.del(`appointments:${doctorId}:${date}`);
        console.log(`Cache invalidated for appointments:${doctorId}:${date}`);

        // send RabbitMQ queue
        const notification = {
            email,
            subject: 'Appointment Confirmation',
            text: `Your appointment with Dr. ${doctor.name} has been booked for ${date} at ${time}.`,
        };
        await sendMessage('notificationQueue', notification);

        res.status(201).json({ message: 'Appointment booked and notification sent.', appointment: newAppointment });
    } catch (err) {
        console.error('Error booking appointment:', err.message);
        res.status(500).json({ error: 'Failed to book appointment.' });
    }
});

 // Redis cache list doctor appointment queue
router.get('/doctor/:id/date/:date', async (req, res) => {
    const { id: doctorId, date } = req.params;

    try {
        const cacheKey = `appointments:${doctorId}:${date}`;

        // Cache check
        const cachedData = await client.get(cacheKey);
        if (cachedData) {
            console.log('Cache hit');
            return res.status(200).json(JSON.parse(cachedData));
        }

       
        const appointments = await Appointment.find({ doctorId, date });
        if (!appointments.length) {
            return res.status(404).json({ error: 'No appointments found for this doctor on this date' });
        }

        
        await client.setEx(cacheKey, 3600, JSON.stringify(appointments));
        console.log('Cache miss');
        res.status(200).json(appointments);
    } catch (err) {
        console.error('Error fetching appointments:', err.message);
        res.status(500).json({ error: 'Failed to fetch appointments.' });
    }
});


router.put('/:id', async (req, res) => {
    const appointmentId = req.params.id;
    const updates = req.body;

    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(appointmentId, updates, { new: true });
        if (!updatedAppointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // clear Cache
        await client.del(`appointments:${updatedAppointment.doctorId}:${updatedAppointment.date}`);
        console.log(`Cache invalidated for appointments:${updatedAppointment.doctorId}:${updatedAppointment.date}`);

        // send notification for patient
        const notification = {
            email: updates.email, 
            subject: 'Appointment Updated',
            text: `Your appointment has been updated to ${updatedAppointment.date} at ${updatedAppointment.time}.`,
        };
        await sendMessage('notificationQueue', notification);

        res.status(200).json({ message: 'Appointment updated, cache invalidated, and notification sent.', appointment: updatedAppointment });
    } catch (err) {
        console.error('Error updating appointment:', err.message);
        res.status(500).json({ error: 'Failed to update appointment.' });
    }
});


router.delete('/:id', async (req, res) => {
    const appointmentId = req.params.id;

    try {
        const appointment = await Appointment.findByIdAndDelete(appointmentId);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

       
        await client.del(`appointments:${appointment.doctorId}:${appointment.date}`);
        console.log(`Cache invalidated for appointments:${appointment.doctorId}:${appointment.date}`);

        res.status(200).json({ message: 'Appointment deleted and cache invalidated.' });
    } catch (err) {
        console.error('Error deleting appointment:', err.message);
        res.status(500).json({ error: 'Failed to delete appointment.' });
    }
});

router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value.' });
    }

    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedAppointment) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        res.status(200).json({ message: 'Appointment status updated.', appointment: updatedAppointment });
    } catch (err) {
        console.error('Error updating appointment status:', err.message);
        res.status(500).json({ error: 'Failed to update appointment status.' });
    }
});



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

module.exports = router;
