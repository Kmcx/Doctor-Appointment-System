const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }, // Doktor ID'si
    patientId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Hasta ID'si
    date: { type: String, required: true }, // Randevu tarihi
    time: { type: String, required: true }, // Randevu saati
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }, // Randevu durumu
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
