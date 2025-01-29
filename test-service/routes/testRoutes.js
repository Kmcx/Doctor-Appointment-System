const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'Test Service is healthy!' });
});

// Basit bir test endpoint
router.get('/test', (req, res) => {
    res.status(200).json({ message: 'Test Service is working!' });
});

// POST için echo endpoint
router.post('/echo', (req, res) => {
    res.status(200).json({ received: req.body });
});

module.exports = router;
