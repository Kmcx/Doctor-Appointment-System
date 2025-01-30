const express = require('express');
const cors = require('cors'); // CORS modülünü ekliyoruz
const Comment = require('../models/Comment');
const sendMessage = require('../queue/producer');

const router = express.Router();

// CORS
router.use(cors());

// Add a comment
router.post('/', async (req, res) => {
    const { doctorId, userId, comment, rating } = req.body;

    try {
        const newComment = new Comment({ doctorId, userId, comment, rating });
        await newComment.save();

        const notification = {
            email: 'kutaycetiner@gmail.com', 
            subject: 'New Review Received',
            text: `You received a new review: "${comment}"`,
        };
        await sendMessage('notificationQueue', notification);

        res.status(201).json({ message: 'Comment added and notification sent.' });
    } catch (err) {
        console.error('Error adding comment:', err.message);
        res.status(500).json({ error: 'Failed to add comment.' });
    }
});


router.get('/:doctorId', async (req, res) => {
    try {
        if (!req.params.doctorId) {
            return res.status(400).json({ error: 'Doctor ID is required.' });
        }

        const comments = await Comment.find({ doctorId: req.params.doctorId });
        
        // CORS 
        res.header("Access-Control-Allow-Origin", "*");
        res.status(200).json(comments);
    } catch (err) {
        console.error('Error fetching comments:', err.message);
        res.status(500).json({ error: 'Failed to fetch comments.' });
    }
});

module.exports = router;
