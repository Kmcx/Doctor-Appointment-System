const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
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
};
