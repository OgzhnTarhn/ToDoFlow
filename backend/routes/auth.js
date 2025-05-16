const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');
const { sequelize } = require('../config/db');

// Register route
router.post('/register', [
    body('username').notEmpty().withMessage('Kullanıcı adı gerekli'),
    body('email').isEmail().withMessage('Geçerli bir email adresi girin'),
    body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        // Email ve username kontrolü
        const userExists = await User.findOne({
            where: {
                [Op.or]: [{ email }, { username }]
            }
        });

        if (userExists) {
            return res.status(400).json({ message: 'Bu email veya kullanıcı adı zaten kullanımda' });
        }

        // Yeni kullanıcı oluştur
        const user = await User.create({
            username,
            email,
            password
        });

        // JWT token oluştur
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || 'gizli-anahtar',
            { expiresIn: '30d' }
        );

        res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            token
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            message: 'Kayıt işlemi sırasında bir hata oluştu',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Login route
router.post('/login', [
    body('email').isEmail().withMessage('Geçerli bir email adresi girin'),
    body('password').exists().withMessage('Şifre gerekli')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Kullanıcıyı bul
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Geçersiz email veya şifre' });
        }

        // Şifreyi kontrol et
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Geçersiz email veya şifre' });
        }

        // JWT token oluştur
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || 'gizli-anahtar',
            { expiresIn: '30d' }
        );

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router; 