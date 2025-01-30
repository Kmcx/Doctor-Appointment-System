const { createProxyMiddleware } = require('http-proxy-middleware');


const handleProxyError = (serviceName) => (err, req, res) => {
    console.error(`Error in ${serviceName} proxy:`, err.message);
    res.status(503).send(`${serviceName} is unavailable.`);
};


module.exports = (app) => {
    app.use(
        '/comments',
        createProxyMiddleware({
            target: process.env.COMMENTS_SERVICE_URL,
            changeOrigin: true,
            onProxyReq: (proxyReq, req, res) => {
                console.log('Proxying request to Comments Service:', req.method, req.url);
            },
            onError: handleProxyError('Comments Service'),
            
        })
    );

    app.use(
        '/appointments',
        createProxyMiddleware({
            target: process.env.APPOINTMENT_SERVICE_URL, // http://localhost:5002
            changeOrigin: true,
            onProxyReq: (proxyReq, req, res) => {
                console.log(`[Gateway] Forwarding request to: ${req.method} ${proxyReq.path}`);
            },
            onError: handleProxyError('Appointment Service'),
        })
    );
    

    app.use(
        '/notifications',
        createProxyMiddleware({
            target: process.env.NOTIFICATION_SERVICE_URL,
            changeOrigin: true,
            onProxyReq: (proxyReq, req, res) => {
                console.log('Proxying request to Notification Service:', req.method, req.url);
            },
            onError: handleProxyError('Notification Service'),
        })
    );

    app.use(
        '/test-service', // Gateway 
        createProxyMiddleware({
            target: 'http://localhost:5005', // Test Service URL
            changeOrigin: true,
            onProxyReq: (proxyReq, req, res) => {
                console.log(`[Gateway] Forwarding request to Test Service: ${req.method} ${proxyReq.path}`);
            },
            onError: (err, req, res) => {
                console.error(`[Gateway] Error forwarding to Test Service: ${err.message}`);
                res.status(503).send('Test Service is unavailable.');
            },
        })
    );
    
};
