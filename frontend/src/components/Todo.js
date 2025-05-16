import React, { useState, useEffect } from 'react';
import { todoService } from '../services/todoService';
import { categoryService } from '../services/categoryService';
import CategoryManager from './CategoryManager';
import '../styles/Todo.css';

const Todo = () => {
    const [todos, setTodos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newTodo, setNewTodo] = useState({ title: '', category: '' });
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadTodos();
        loadCategories();
    }, []);

    const loadTodos = async () => {
        try {
            const data = await todoService.getTodos();
            setTodos(data);
        } catch (error) {
            console.error('Todo\'lar yüklenirken hata:', error);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Kategoriler yüklenirken hata:', error);
        }
    };

    const handleCreateTodo = async (e) => {
        e.preventDefault();
        try {
            await todoService.createTodo(newTodo);
            setNewTodo({ title: '', category: '' });
            loadTodos();
        } catch (error) {
            console.error('Todo oluşturulurken hata:', error);
        }
    };

    const handleToggleComplete = async (id, completed) => {
        try {
            await todoService.updateTodo(id, { completed: !completed });
            loadTodos();
        } catch (error) {
            console.error('Todo güncellenirken hata:', error);
        }
    };

    const handleDeleteTodo = async (id) => {
        try {
            await todoService.deleteTodo(id);
            loadTodos();
        } catch (error) {
            console.error('Todo silinirken hata:', error);
        }
    };

    const filteredTodos = todos.filter(todo => {
        const matchesCategory = selectedCategory === 'all' || todo.category === selectedCategory;
        const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="todo-container">
            <h2>Todo Listesi</h2>

            {/* Arama ve Filtreleme */}
            <div className="todo-filters">
                <input
                    type="text"
                    placeholder="Todo ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-filter"
                >
                    <option value="all">Tüm Kategoriler</option>
                    {categories.map(category => (
                        <option key={category._id} value={category._id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Yeni Todo Formu */}
            <form onSubmit={handleCreateTodo} className="todo-form">
                <input
                    type="text"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                    placeholder="Yeni todo ekle"
                    required
                />
                <select
                    value={newTodo.category}
                    onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                >
                    <option value="">Kategori Seçin</option>
                    {categories.map(category => (
                        <option key={category._id} value={category._id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <button type="submit">Ekle</button>
            </form>

            {/* Todo Listesi */}
            <div className="todo-list">
                {filteredTodos.map(todo => (
                    <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                        <div className="todo-content">
                            <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => handleToggleComplete(todo._id, todo.completed)}
                            />
                            <span>{todo.title}</span>
                            {todo.category && (
                                <div
                                    className="todo-category"
                                    style={{
                                        backgroundColor: categories.find(c => c._id === todo.category)?.color || '#808080'
                                    }}
                                />
                            )}
                        </div>
                        <button onClick={() => handleDeleteTodo(todo._id)}>Sil</button>
                    </div>
                ))}
            </div>

            {/* Kategori Yöneticisi */}
            <CategoryManager onCategorySelect={loadCategories} />
        </div>
    );
};

export default Todo; 