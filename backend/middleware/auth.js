const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

        // Kullanıcı bilgisini request'e ekle
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Yetkilendirme hatası: Geçersiz token' });
    }
};

module.exports = { protect }; 