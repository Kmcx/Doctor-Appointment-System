const express = require('express');
const app = express();


app.use(express.json());


app.use('/', require('./routes/testRoutes'));

// 404 fallback
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found in Test Service.' });
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
    console.log(`Test Service running on port ${PORT}`);
});
