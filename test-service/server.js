const express = require('express');
const app = express();

// JSON desteği ekle
app.use(express.json());

// Routes klasöründen testRoutes'u içe aktar ve kullan
app.use('/', require('./routes/testRoutes'));

// 404 fallback
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found in Test Service.' });
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
    console.log(`Test Service running on port ${PORT}`);
});
