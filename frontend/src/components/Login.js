import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Hata mesajını temizle
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Giriş yapılırken bir hata oluştu');
      }

      // Token'ı localStorage'a kaydet
      localStorage.setItem('token', data.token);

      // Ana sayfaya yönlendir
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
      <div className="auth-container">
        <div className="auth-box">
          <h2>Giriş Yap</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email:</label>
              <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  required
              />
            </div>
            <button type="submit" className="auth-button">Giriş Yap</button>
          </form>
          <p className="auth-switch">
            Hesabınız yok mu? <a href="/register">Kayıt Ol</a>
          </p>
        </div>
      </div>
  );
};

export default Login; 