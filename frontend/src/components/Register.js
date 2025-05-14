import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { register, clearError } from '../store/slices/authSlice';
import './Register.css';

const registerSchema = Yup.object().shape({
    username: Yup.string()
        .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
        .required('Kullanıcı adı zorunludur'),
    email: Yup.string()
        .email('Geçerli bir email adresi giriniz')
        .required('Email adresi zorunludur'),
    password: Yup.string()
        .min(6, 'Şifre en az 6 karakter olmalıdır')
        .required('Şifre zorunludur'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Şifreler eşleşmiyor')
        .required('Şifre tekrarı zorunludur')
});

const Register = () => {
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
        const { confirmPassword, ...registerData } = values;
        dispatch(register(registerData));
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Kayıt Ol</h2>
                <Formik
                    initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
                    validationSchema={registerSchema}
                    onSubmit={handleSubmit}
                >
                    {({ errors, touched }) => (
                        <Form>
                            <div className="form-group">
                                <Field
                                    type="text"
                                    name="username"
                                    placeholder="Kullanıcı Adı"
                                    className={errors.username && touched.username ? 'error' : ''}
                                />
                                {errors.username && touched.username && (
                                    <div className="error-message">{errors.username}</div>
                                )}
                            </div>

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

                            <div className="form-group">
                                <Field
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Şifre Tekrarı"
                                    className={errors.confirmPassword && touched.confirmPassword ? 'error' : ''}
                                />
                                {errors.confirmPassword && touched.confirmPassword && (
                                    <div className="error-message">{errors.confirmPassword}</div>
                                )}
                            </div>

                            <button type="submit" disabled={loading}>
                                {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                            </button>
                        </Form>
                    )}
                </Formik>

                <p className="login-link">
                    Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link>
                </p>
            </div>
        </div>
    );
};

export default Register; 