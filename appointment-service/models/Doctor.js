const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Doktor adı
    specialization: { type: String, required: true }, // Uzmanlık alanı
    email: { type: String, required: true, unique: true }, 
    availability: [
        {
            day: { type: String, required: true }, // Müsaitlik günü
            slots: [String], // Saat aralıkları
        },
    ],
    address: {
        line1: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        geoLocation: {
            lat: { type: Number }, // Latitude
            lng: { type: Number }, // Longitude
        },
    },
    isApproved: { type: Boolean, default: false }, // Yönetici onayı
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Doctor', DoctorSchema);
