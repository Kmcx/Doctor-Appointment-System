const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
require('./auth/googleAuth'); // Google OAuth Middleware
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const gatewayRoutes = require('./routes/gatewayRoutes');

dotenv.config({ path: path.resolve(__dirname, './.env') });

const app = express();
app.use(cors());

// Load gateway routes
require('./routes/gatewayRoutes')(app);

// Default route for the root URL
app.get('/', (req, res) => {
    res.send('API Gateway is running!');
});




app.use(
    session({
        secret: process.env.SESSION_SECRET || 'your-session-secret', 
        resave: false, 
        saveUninitialized: true, 
        cookie: {
            maxAge: 1000 * 60 * 60, 
            secure: false, 
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
gatewayRoutes(app);
app.use('/auth', authRoutes);


app.get('/health/:service', async (req, res) => {
    const { service } = req.params;
    const services = {
        comments: process.env.COMMENTS_SERVICE_URL,
        appointments: process.env.APPOINTMENT_SERVICE_URL,
        notifications: process.env.NOTIFICATION_SERVICE_URL,
    };

    if (!services[service]) {
        return res.status(400).json({ error: 'Unknown service' });
    }

    try {
        const response = await fetch(services[service] + '/health');
        if (!response.ok) throw new Error('Service not healthy');
        res.status(200).json({ status: `${service} is healthy` });
    } catch {
        res.status(503).json({ status: `${service} is unavailable` });
    }
});

app.get('/session-test', (req, res) => {
    if (req.session.passport) {
        res.json({ session: req.session.passport });
    } else {
        res.json({ message: 'No session data found' });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
