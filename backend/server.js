const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
require('dotenv').config();
const User = require('./models/User');
const Category = require('./models/Category');
const Todo = require('./models/Todo');

const app = express();

// CORS ayarları
app.use(cors({
    origin: 'http://localhost:3000', // React uygulamasının çalıştığı port
    credentials: true
}));

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/todos', require('./routes/todos'));

// Model ilişkileri
User.hasMany(Todo, { foreignKey: 'userId' });
Todo.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Category, { foreignKey: 'userId' });
Category.belongsTo(User, { foreignKey: 'userId' });

Category.hasMany(Todo, { foreignKey: 'categoryId' });
Todo.belongsTo(Category, { foreignKey: 'categoryId' });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Hata:', err);
    res.status(500).json({ 
        message: 'Bir şeyler ters gitti!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3001;

// Önce veritabanı bağlantısını kur, sonra sunucuyu başlat
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server ${PORT} portunda çalışıyor`);
        });
    } catch (error) {
        console.error('Sunucu başlatma hatası:', error);
        process.exit(1);
    }
};

startServer();
