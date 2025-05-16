const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
    { name: 'Genel', color: '#808080' },
    { name: 'Ev', color: '#4caf50' },
    { name: 'Okul', color: '#2196f3' },
    { name: 'İş', color: '#ff9800' },
    { name: 'Sağlık', color: '#e91e63' },
    { name: 'Alışveriş', color: '#9c27b0' },
    { name: 'Kişisel', color: '#f44336' },
    { name: 'Diğer', color: '#607d8b' }
];

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Yetkilendirme hatası: Token bulunamadı' });
        }

        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli-anahtar');

        // Kullanıcıyı bul
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Yetkilendirme hatası: Kullanıcı bulunamadı' });
        }

        // Kullanıcı için sabit kategorileri oluştur (eksik olanları ekle)
        for (const cat of DEFAULT_CATEGORIES) {
            const exists = await Category.findOne({ where: { userId: user.id, name: cat.name } });
            if (!exists) {
                await Category.create({ ...cat, userId: user.id });
            }
        }

        // Kullanıcı bilgisini request'e ekle
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Yetkilendirme hatası: Geçersiz token' });
    }
};

module.exports = { protect }; 