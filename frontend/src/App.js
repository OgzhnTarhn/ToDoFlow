import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Login from './components/Login';
import Register from './components/Register';
import TodoList from './components/TodoList';

// Redux
import { getMe } from './store/slices/authSlice';

// Styles
import './App.css';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useSelector((state) => state.auth);
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        if (token) {
            dispatch(getMe());
        }
    }, [dispatch, token]);

    return (
        <Router>
            <div className="App">
                <ToastContainer position="top-right" autoClose={3000} />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <TodoList />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App; 