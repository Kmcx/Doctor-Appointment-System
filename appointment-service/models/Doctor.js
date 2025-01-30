const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Doktor name
    specialization: { type: String, required: true }, 
    email: { type: String, required: true, unique: true }, 
    availability: [
        {
            day: { type: String, required: true }, 
            slots: [String], 
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
    isApproved: { type: Boolean, default: false }, // is approved
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Doctor', DoctorSchema);
