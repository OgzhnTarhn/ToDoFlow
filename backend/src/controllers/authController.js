const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Token oluşturma fonksiyonu
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'ÇOK_GİZLİ_SIFRE', {
        expiresIn: '30d'
    });
};

// @desc    Kullanıcı kaydı
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Kullanıcı var mı kontrol et
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Kullanıcı oluştur
        const user = await User.create({
            username,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kullanıcıyı bul
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Şifreyi kontrol et
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Kullanıcı bilgilerini getir
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe
}; 