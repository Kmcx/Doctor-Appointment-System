const express = require("express");
const Patient = require("../models/Patient");

const router = express.Router();

// Hasta Kaydı
router.post("/register", async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required." });
    }

    try {
        let patient = await Patient.findOne({ email });

        if (patient) {
            return res.status(200).json({ message: "Patient already registered.", patient });
        }

        patient = new Patient({ name, email });
        await patient.save();

        res.status(201).json({ message: "Patient registered successfully.", patient });
    } catch (error) {
        console.error("Error registering patient:", error.message);
        res.status(500).json({ error: "Failed to register patient." });
    }
});

module.exports = router;
