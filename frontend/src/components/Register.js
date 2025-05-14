import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.username) {
      setError('Kullanıcı adı gereklidir');
      return false;
    }
    if (!formData.email) {
      setError('Email adresi gereklidir');
      return false;
    }
    if (!formData.password) {
      setError('Şifre gereklidir');
      return false;
    }
    if (!formData.confirmPassword) {
      setError('Şifre tekrarı gereklidir');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt olurken bir hata oluştu');
      }

      // Başarılı kayıt sonrası login sayfasına yönlendir
      navigate('/login', { state: { message: 'Kayıt başarılı! Giriş yapabilirsiniz.' } });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
      <div className="auth-container">
        <div className="auth-box">
          <h2>Kayıt Ol</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Kullanıcı Adı:</label>
              <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Kullanıcı adınızı girin"
                  required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@email.com"
                  required
              />
            </div>
            <div className="form-group">
              <label>Şifre:</label>
              <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="En az 6 karakter"
                  required
              />
            </div>
            <div className="form-group">
              <label>Şifre Tekrar:</label>
              <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Şifrenizi tekrar girin"
                  required
              />
            </div>
            <button type="submit" className="auth-button">Kayıt Ol</button>
          </form>
          <p className="auth-switch">
            Zaten hesabınız var mı? <a href="/login">Giriş Yap</a>
          </p>
        </div>
      </div>
  );
};

export default Register; 