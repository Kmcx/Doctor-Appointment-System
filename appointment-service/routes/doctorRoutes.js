const express = require('express');
const Doctor = require('../models/Doctor');
const { ensureAdmin } = require('../middleware/authMiddleware');
const router = express.Router();
const { getGeoLocation } = require('../utils/geoLocation');
const mongoose = require('mongoose'); 

// Doctor search route
router.get('/search', async (req, res) => {
    const { name, specialization, city } = req.query;

    try {
        // Arama kriterlerini kontrol et
        const query = {};
        if (name) query.name = { $regex: name, $options: 'i' }; // İsme göre arama (case-insensitive)
        if (specialization) query.specialization = { $regex: specialization, $options: 'i' }; // Uzmanlık alanı
        if (city) query['address.city'] = { $regex: city, $options: 'i' }; // Şehir filtresi

        // Doktorları filtrele ve getir
        const doctors = await Doctor.find(query, {
            name: 1,
            specialization: 1,
            address: 1,
            availability: 1,
        });

        res.status(200).json(doctors);
    } catch (err) {
        console.error('Error fetching doctors:', err.message);
        res.status(500).json({ error: 'Failed to search doctors.' });
    }
});


// Doctor register route
router.post('/register', async (req, res) => {
    const { name, specialization, email, availability, address } = req.body;

    console.log("Backend'e Gelen Veri:", req.body); // Backend'e ulaşan veriyi loglayın
    
    try {
        // Email alanını kontrol edin
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'Invalid or missing email address.' });
        }

        // Aynı email ile kayıtlı doktor var mı kontrol et
        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return res.status(200).json({
                message: 'Doctor already registered.',
                doctor: existingDoctor,
            });
        }

        // Adres için geolocation bilgisi al
        const geoLocation = await getGeoLocation(address);
        if (!geoLocation) {
            return res.status(400).json({ error: 'Failed to fetch geolocation for address.' });
        }

        // Yeni doktor kaydı oluştur
        const newDoctor = new Doctor({
            name,
            specialization,
            email,
            availability,
            address: { ...address, geoLocation },
        });

        // Veritabanına kaydet
        await newDoctor.save();

        res.status(201).json({
            message: 'Doctor registered successfully with geolocation.',
            doctor: newDoctor,
        });
    } catch (err) {
        if (err.code === 11000) {
            // Duplicate email hatası
            return res.status(400).json({ error: 'Email already exists. Please use a unique email address.' });
        }
        console.error('Error registering doctor:', err.message);
        res.status(500).json({ error: 'Failed to register doctor.' });
    }
});

// admin approve route
router.put('/approve/:doctorId', async (req, res) => {
    const { doctorId } = req.params;
    const { address } = req.body;

    try {
        const updatedDoctor = await Doctor.findByIdAndUpdate(
            doctorId,
            {
                $set: {
                    isApproved: true,
                    ...(address && { address }),
                },
            },
            { new: true }
        );

        if (!updatedDoctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        res.status(200).json({
            message: 'Doctor approved successfully.',
            doctor: updatedDoctor,
        });
    } catch (err) {
        console.error('Error approving doctor:', err.message);
        res.status(500).json({ error: 'Failed to approve doctor.' });
    }
});

// GET /api/doctors/:id - Doktor detaylarını getir
router.get('/:id', async (req, res) => {
    const doctorId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        console.error(`Invalid doctor ID received: ${doctorId}`);
        return res.status(400).json({ error: 'Invalid doctor ID format.' });
    }

    try {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found.' });
        }

        res.status(200).json(doctor);
    } catch (err) {
        console.error('Error fetching doctor details:', err.message);
        res.status(500).json({ error: 'Failed to fetch doctor details.' });
    }
});


// GET /api/doctors/map - Onaylı doktorları döndür
router.get('/map', async (req, res) => {
    try {
        const doctors = await Doctor.find({ isApproved: true });

        if (!doctors || doctors.length === 0) {
            return res.status(404).json({ error: 'No approved doctors found.' });
        }

        // Eğer yanlış veri formatı varsa, hata vermek yerine boş array döndür
        if (!Array.isArray(doctors)) {
            console.error("Doctors API response is not an array:", doctors);
            return res.status(400).json({ error: "Invalid API response format." });
        }

        res.status(200).json(doctors.map(doc => ({
            _id: doc._id.toString(), // ObjectId'yi string formatına çeviriyoruz
            name: doc.name,
            specialization: doc.specialization,
            geoLocation: doc.address?.geoLocation || null, // Eğer konum bilgisi yoksa null döndür
        })));
    } catch (err) {
        console.error('Error fetching doctors for map:', err.message);
        res.status(500).json({ error: 'Failed to fetch doctors for map.' });
    }
});


router.get('/', async (req, res) => {
    try {
        // Sadece onaylanmış doktorları getir
        const doctors = await Doctor.find({ isApproved: true });

        if (!doctors || doctors.length === 0) {
            return res.status(404).json({ error: 'No approved doctors found.' });
        }

        // ObjectId'yi string formatına çevir ve gerekli alanları döndür
        res.status(200).json(doctors.map(doc => ({
            _id: doc._id.toString(),
            name: doc.name,
            specialization: doc.specialization,
            email: doc.email,
            availability: doc.availability || [],
            address: doc.address || {},
            isApproved: doc.isApproved,
            createdAt: doc.createdAt,
        })));
    } catch (err) {
        console.error('Error fetching doctors:', err.message);
        res.status(500).json({ error: 'Failed to fetch doctors.' });
    }
});



module.exports = router;
