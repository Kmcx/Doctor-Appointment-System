const express = require('express');
const Comment = require('../models/Comment');
const sendMessage = require('../queue/producer');

const router = express.Router();

// Add a comment
router.post('/', async (req, res) => {
    const { doctorId, userId, comment, rating } = req.body;

    try {
        // Save the comment
        const newComment = new Comment({ doctorId, userId, comment, rating });
        await newComment.save();

        // Notify the doctor
        const notification = {
            email: 'kutaycetiner@gmail.com', // Replace with dynamic email from DB
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

// Get comments for a doctor
router.get('/:doctorId', async (req, res) => {
    try {
        const comments = await Comment.find({ doctorId: req.params.doctorId });
        res.status(200).json(comments);
    } catch (err) {
        console.error('Error fetching comments:', err.message);
        res.status(500).json({ error: 'Failed to fetch comments.' });
    }
});



module.exports = router;
