const express = require('express');
const router = express.Router();

// Geçici route'lar
router.get('/', (req, res) => {
    res.json({ message: 'Get all todos' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Create todo' });
});

router.put('/:id', (req, res) => {
    res.json({ message: 'Update todo' });
});

router.delete('/:id', (req, res) => {
    res.json({ message: 'Delete todo' });
});

module.exports = router; 