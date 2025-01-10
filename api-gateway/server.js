const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Load gateway routes
require('./routes/gatewayRoutes')(app);

// Default route for the root URL
app.get('/', (req, res) => {
    res.send('API Gateway is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
