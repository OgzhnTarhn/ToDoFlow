const Category = require('../models/Category');

// Kategori oluştur
exports.createCategory = async (req, res) => {
    try {
        const category = new Category({
            ...req.body,
            user: req.user._id
        });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Kullanıcının kategorilerini getir
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ user: req.user._id });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Kategori güncelle
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        if (!category) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Kategori sil
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        if (!category) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }
        res.json({ message: 'Kategori silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 