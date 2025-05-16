const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Todo = require('../models/Todo');
const { protect } = require('../middleware/auth');

// Tüm route'lar için authentication gerekli
router.use(protect);

// Tüm todoları getir
router.get('/', async (req, res) => {
    try {
        const filter = { userId: req.user.id };
        if (req.query.category) {
            filter.categoryId = req.query.category;
        }
        const todos = await Todo.findAll({
            where: filter,
            order: [['createdAt', 'DESC']]
        });
        res.json(todos);
    } catch (error) {
        console.error('Get todos error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Yeni todo oluştur
router.post('/', [
    body('title').notEmpty().withMessage('Başlık gerekli')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const todo = await Todo.create({
            title: req.body.title,
            description: req.body.description,
            userId: req.user.id
        });

        res.status(201).json(todo);
    } catch (error) {
        console.error('Create todo error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Todo güncelle
router.put('/:id', async (req, res) => {
    try {
        const todo = await Todo.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!todo) {
            return res.status(404).json({ message: 'Todo bulunamadı' });
        }

        await todo.update({
            title: req.body.title || todo.title,
            description: req.body.description || todo.description,
            completed: req.body.completed !== undefined ? req.body.completed : todo.completed
        });

        res.json(todo);
    } catch (error) {
        console.error('Update todo error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Todo sil
router.delete('/:id', async (req, res) => {
    try {
        const todo = await Todo.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!todo) {
            return res.status(404).json({ message: 'Todo bulunamadı' });
        }

        await todo.destroy();
        res.json({ message: 'Todo silindi' });
    } catch (error) {
        console.error('Delete todo error:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router; 