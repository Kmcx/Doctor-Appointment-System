const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Hasta adı
    email: { type: String, required: true, unique: true }, // E-posta (unique olacak)
    createdAt: { type: Date, default: Date.now } // Kayıt tarihi
});

module.exports = mongoose.model("Patient", PatientSchema);
