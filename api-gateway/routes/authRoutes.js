const express = require('express');
const passport = require('passport');
const router = express.Router();

// Google Login Endpoint
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'], 
    })
);

// Google OAuth Callback
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        console.log('Session Data:', req.session); 
        console.log('User Data:', req.user); 

        res.json({ message: 'Login successful', user: req.user });
    }
);
 

// Logout Endpoint
router.get('/logout', (req, res) => {
   req.logout((err) => {
       if (err) return res.status(500).json({ error: 'Logout failed.' });
       res.json({ message: 'Logged out successfully.' });
   });
});




module.exports = router;
