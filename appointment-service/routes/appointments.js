const express = require('express');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const sendMessage = require('../queue/producer'); // RabbitMQ kuyruğu için
const client = require('../redisClient'); // Redis önbelleği için

const router = express.Router();

// 1. Randevu oluşturma
router.post('/', async (req, res) => {
    console.log('POST /appointments called with body:', req.body);
    const { doctorId, patientId, date, time, email } = req.body;

    try {
        // Doktorun varlığını kontrol et
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found.' });
        }

        // Yeni randevu oluştur
        const newAppointment = new Appointment({
            doctorId,
            patientId,
            date,
            time,
        });
        await newAppointment.save();

        // Redis önbelleğini temizle
        await client.del(`appointments:${doctorId}:${date}`);
        console.log(`Cache invalidated for appointments:${doctorId}:${date}`);

        // RabbitMQ kuyruğuna mesaj gönder
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

// 2. Bir doktorun profiline göre randevuları listeleme (Redis cache ile)
router.get('/doctor/:id/date/:date', async (req, res) => {
    const { id: doctorId, date } = req.params;

    try {
        const cacheKey = `appointments:${doctorId}:${date}`;

        // Cache kontrolü
        const cachedData = await client.get(cacheKey);
        if (cachedData) {
            console.log('Cache hit');
            return res.status(200).json(JSON.parse(cachedData));
        }

        // Veritabanından randevuları getir
        const appointments = await Appointment.find({ doctorId, date });
        if (!appointments.length) {
            return res.status(404).json({ error: 'No appointments found for this doctor on this date' });
        }

        // Randevuları cache'e kaydet
        await client.setEx(cacheKey, 3600, JSON.stringify(appointments));
        console.log('Cache miss');
        res.status(200).json(appointments);
    } catch (err) {
        console.error('Error fetching appointments:', err.message);
        res.status(500).json({ error: 'Failed to fetch appointments.' });
    }
});

// 3. Randevu güncelleme
router.put('/:id', async (req, res) => {
    const appointmentId = req.params.id;
    const updates = req.body;

    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(appointmentId, updates, { new: true });
        if (!updatedAppointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Cache'i temizle
        await client.del(`appointments:${updatedAppointment.doctorId}:${updatedAppointment.date}`);
        console.log(`Cache invalidated for appointments:${updatedAppointment.doctorId}:${updatedAppointment.date}`);

        // Hasta için bildirim gönder
        const notification = {
            email: updates.email, // Dinamik olarak e-posta alın
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

// 4. Randevu silme
router.delete('/:id', async (req, res) => {
    const appointmentId = req.params.id;

    try {
        const appointment = await Appointment.findByIdAndDelete(appointmentId);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Cache'i temizle
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


// 5. Eksik randevu bildirimi
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
