import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import { SketchPicker } from 'react-color';

const CategoryManager = ({ onCategorySelect }) => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', color: '#808080' });
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Kategoriler yüklenirken hata:', error);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            await categoryService.createCategory(newCategory);
            setNewCategory({ name: '', color: '#808080' });
            loadCategories();
        } catch (error) {
            console.error('Kategori oluşturulurken hata:', error);
        }
    };

    const handleUpdateCategory = async (id, updatedData) => {
        try {
            await categoryService.updateCategory(id, updatedData);
            setEditingCategory(null);
            loadCategories();
        } catch (error) {
            console.error('Kategori güncellenirken hata:', error);
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await categoryService.deleteCategory(id);
            loadCategories();
        } catch (error) {
            console.error('Kategori silinirken hata:', error);
        }
    };

    return (
        <div className="category-manager">
            <h3>Kategoriler</h3>
            
            {/* Yeni Kategori Formu */}
            <form onSubmit={handleCreateCategory} className="category-form">
                <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Yeni kategori adı"
                    required
                />
                <div className="color-picker-container">
                    <div
                        className="color-preview"
                        style={{ backgroundColor: newCategory.color }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                    />
                    {showColorPicker && (
                        <div className="color-picker-popover">
                            <div className="color-picker-cover" onClick={() => setShowColorPicker(false)} />
                            <SketchPicker
                                color={newCategory.color}
                                onChange={(color) => setNewCategory({ ...newCategory, color: color.hex })}
                            />
                        </div>
                    )}
                </div>
                <button type="submit">Ekle</button>
            </form>

            {/* Kategori Listesi */}
            <div className="category-list">
                {categories.map((category) => (
                    <div key={category._id} className="category-item">
                        {editingCategory === category._id ? (
                            <div className="category-edit">
                                <input
                                    type="text"
                                    value={category.name}
                                    onChange={(e) => handleUpdateCategory(category._id, { ...category, name: e.target.value })}
                                />
                                <button onClick={() => setEditingCategory(null)}>İptal</button>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="category-color"
                                    style={{ backgroundColor: category.color }}
                                />
                                <span>{category.name}</span>
                                <div className="category-actions">
                                    <button onClick={() => setEditingCategory(category._id)}>Düzenle</button>
                                    <button onClick={() => handleDeleteCategory(category._id)}>Sil</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryManager; 