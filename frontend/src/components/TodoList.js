import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { logout } from '../store/slices/authSlice';
import { fetchTodos, createTodo, updateTodo, deleteTodo, clearError } from '../store/slices/todoSlice';
import './TodoList.css';

const todoSchema = Yup.object().shape({
    text: Yup.string()
        .required('Todo metni zorunludur')
        .min(3, 'Todo metni en az 3 karakter olmalıdır'),
    category: Yup.string()
        .required('Kategori zorunludur')
});

const TodoList = () => {
    const dispatch = useDispatch();
    const { todos, loading, error } = useSelector((state) => state.todos);
    const { user } = useSelector((state) => state.auth);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        dispatch(fetchTodos());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleSubmit = async (values, { resetForm }) => {
        await dispatch(createTodo(values));
        resetForm();
    };

    const handleToggleComplete = async (todo) => {
        dispatch(updateTodo({
            id: todo._id,
            todoData: { completed: !todo.completed }
        }));
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu todo\'yu silmek istediğinizden emin misiniz?')) {
            dispatch(deleteTodo(id));
        }
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    const filteredTodos = todos.filter(todo => {
        if (filter === 'completed') return todo.completed;
        if (filter === 'active') return !todo.completed;
        return true;
    });

    return (
        <div className="todo-container">
            <div className="todo-header">
                <h2>Todo List</h2>
                <div className="user-info">
                    <span>Hoş geldin, {user?.username}</span>
                    <button onClick={handleLogout} className="logout-button">
                        Çıkış Yap
                    </button>
                </div>
            </div>

            <Formik
                initialValues={{ text: '', category: 'Genel' }}
                validationSchema={todoSchema}
                onSubmit={handleSubmit}
            >
                {({ errors, touched }) => (
                    <Form className="todo-form">
                        <div className="form-group">
                            <Field
                                type="text"
                                name="text"
                                placeholder="Yeni todo ekle..."
                                className={errors.text && touched.text ? 'error' : ''}
                            />
                            {errors.text && touched.text && (
                                <div className="error-message">{errors.text}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <Field
                                as="select"
                                name="category"
                                className={errors.category && touched.category ? 'error' : ''}
                            >
                                <option value="Genel">Genel</option>
                                <option value="İş">İş</option>
                                <option value="Kişisel">Kişisel</option>
                                <option value="Alışveriş">Alışveriş</option>
                            </Field>
                            {errors.category && touched.category && (
                                <div className="error-message">{errors.category}</div>
                            )}
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? 'Ekleniyor...' : 'Ekle'}
                        </button>
                    </Form>
                )}
            </Formik>

            <div className="filter-buttons">
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    Tümü
                </button>
                <button
                    className={filter === 'active' ? 'active' : ''}
                    onClick={() => setFilter('active')}
                >
                    Aktif
                </button>
                <button
                    className={filter === 'completed' ? 'active' : ''}
                    onClick={() => setFilter('completed')}
                >
                    Tamamlanan
                </button>
            </div>

            <div className="todo-list">
                {filteredTodos.map((todo) => (
                    <div
                        key={todo._id}
                        className={`todo-item ${todo.completed ? 'completed' : ''}`}
                    >
                        <div className="todo-content">
                            <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => handleToggleComplete(todo)}
                            />
                            <span className="todo-text">{todo.text}</span>
                            <span className="todo-category">{todo.category}</span>
                        </div>
                        <button
                            className="delete-button"
                            onClick={() => handleDelete(todo._id)}
                        >
                            Sil
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodoList; 