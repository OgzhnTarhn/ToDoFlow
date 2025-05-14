const Todo = require('../models/Todo');

// @desc    Tüm todoları getir
// @route   GET /api/todos
// @access  Private
const getTodos = async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user._id });
        res.json(todos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Yeni todo oluştur
// @route   POST /api/todos
// @access  Private
const createTodo = async (req, res) => {
    try {
        const { text, category } = req.body;

        const todo = await Todo.create({
            text,
            category,
            user: req.user._id
        });

        res.status(201).json(todo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Todo güncelle
// @route   PUT /api/todos/:id
// @access  Private
const updateTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        // Kullanıcı kontrolü
        if (todo.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedTodo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Todo sil
// @route   DELETE /api/todos/:id
// @access  Private
const deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        // Kullanıcı kontrolü
        if (todo.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        await todo.remove();
        res.json({ message: 'Todo removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo
}; 