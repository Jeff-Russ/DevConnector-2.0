const express = require('express');
const connectDB = require('./config/db');

const app = express();
connectDB(); // Connect to Database

app.get('/', (req, res) => res.send('API Running')); // test endpoint

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
