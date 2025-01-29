const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const sendMessage = require('../queue/producer');

// Planlanmış görev: Eksik randevular için bildirim gönderme
const scheduleIncompleteAppointments = () => {
    cron.schedule('0 0 * * *', async () => { // Her gece 00:00'da çalışır
        console.log('Running incomplete appointments job...');

        try {
            const incompleteAppointments = await Appointment.find({ status: 'pending' });

            incompleteAppointments.forEach((appointment) => {
                const notification = {
                    email: 'patient@example.com', // Dinamik e-posta
                    subject: 'Complete Your Appointment',
                    text: `You started booking an appointment for ${appointment.date} but didn't finish. Please complete it to confirm.`,
                };

                sendMessage('notificationQueue', notification);
            });

            console.log('Incomplete appointments processed.');
        } catch (err) {
            console.error('Error processing incomplete appointments:', err.message);
        }
    });
};

module.exports = scheduleIncompleteAppointments;
