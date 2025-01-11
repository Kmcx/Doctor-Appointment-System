const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());


// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));


app.get('/', (req, res) => {
        res.send('Comment service is running!');
});
        
// Routes
app.use('/comments', require('./routes/comments')); 


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Comments Service running on port ${PORT}`));
