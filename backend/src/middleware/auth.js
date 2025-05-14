const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Token'ı al
            token = req.headers.authorization.split(' ')[1];

            // Token'ı doğrula
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ÇOK_GİZLİ_SIFRE');

            // Kullanıcıyı bul ve req'e ekle
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ error: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ error: 'Not authorized, no token' });
    }
};

module.exports = { protect }; 