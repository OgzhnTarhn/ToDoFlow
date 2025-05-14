const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const todoRoutes = require('./src/routes/todoRoutes');

// Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Frontend routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/app.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Connect to database and start server
const PORT = process.env.PORT || 3001;

const start = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

start();
