// Middleware: Admin authorization
const ensureAdmin = (req, res, next) => {
    // user is admin or is approved
    if (req.user && req.user.role === 'admin') {
        return next(); 
    }

   
    res.status(403).json({ error: 'Access denied. Admin only.' });
};

module.exports = { ensureAdmin };
