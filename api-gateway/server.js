const express = require('express');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

dotenv.config();


dotenv.config({ path: path.resolve(__dirname, './.env') });

const app = express();

// Load gateway routes
require('./routes/gatewayRoutes')(app);

// Default route for the root URL
app.get('/', (req, res) => {
    res.send('API Gateway is running!');
});

// Proxy Routes
app.use(
    '/comments',
    createProxyMiddleware({
        target: process.env.COMMENTS_SERVICE_URL,
        changeOrigin: true,
    })
);

app.use(
    '/appointments',
    createProxyMiddleware({
        target: process.env.APPOINTMENT_SERVICE_URL,
        changeOrigin: true,
    })
);

app.use(
    '/notifications',
    createProxyMiddleware({
        target: process.env.NOTIFICATION_SERVICE_URL,
        changeOrigin: true,
    })
);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
