const Category = require('../models/Category');

// Kategori oluştur
exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create({
            ...req.body,
            userId: req.user.id
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Kullanıcının kategorilerini getir
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Kategori güncelle
exports.updateCategory = async (req, res) => {
    try {
        const [updated] = await Category.update(req.body, {
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (!updated) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }
        const updatedCategory = await Category.findOne({ where: { id: req.params.id } });
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Kategori sil
exports.deleteCategory = async (req, res) => {
    try {
        const deleted = await Category.destroy({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (!deleted) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }
        res.json({ message: 'Kategori silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 