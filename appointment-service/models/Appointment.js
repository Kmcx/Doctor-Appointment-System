const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    isComplete: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
