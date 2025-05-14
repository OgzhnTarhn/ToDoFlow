import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { login, clearError } from '../store/slices/authSlice';
import './Login.css';

const loginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Geçerli bir email adresi giriniz')
        .required('Email adresi zorunludur'),
    password: Yup.string()
        .min(6, 'Şifre en az 6 karakter olmalıdır')
        .required('Şifre zorunludur')
});

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleSubmit = async (values) => {
        dispatch(login(values));
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Giriş Yap</h2>
                <Formik
                    initialValues={{ email: '', password: '' }}
                    validationSchema={loginSchema}
                    onSubmit={handleSubmit}
                >
                    {({ errors, touched }) => (
                        <Form>
                            <div className="form-group">
                                <Field
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    className={errors.email && touched.email ? 'error' : ''}
                                />
                                {errors.email && touched.email && (
                                    <div className="error-message">{errors.email}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <Field
                                    type="password"
                                    name="password"
                                    placeholder="Şifre"
                                    className={errors.password && touched.password ? 'error' : ''}
                                />
                                {errors.password && touched.password && (
                                    <div className="error-message">{errors.password}</div>
                                )}
                            </div>

                            <button type="submit" disabled={loading}>
                                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                            </button>
                        </Form>
                    )}
                </Formik>

                <p className="register-link">
                    Hesabınız yok mu? <Link to="/register">Kayıt Ol</Link>
                </p>
            </div>
        </div>
    );
};

export default Login; 