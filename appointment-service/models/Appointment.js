const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }, // Doktor ID
    patientId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Hasta ID
    date: { type: String, required: true }, 
    time: { type: String, required: true }, 
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }, 
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
