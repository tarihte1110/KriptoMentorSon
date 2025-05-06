// src/pages/AuthPage.js 

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, signIn } from '../services/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './AuthPage.css';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setMessage('Parolalar eşleşmiyor!');
        return;
      }
      const { error } = await signUp(email, password);
      setMessage(error?.message || 'Kayıt başarılı! Lütfen e-postanızı onaylayın.');
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setMessage(error.message);
      } else {
        navigate('/', { replace: true });
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{mode === 'signup' ? 'Kayıt Ol' : 'Giriş Yap'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            E-posta
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Parola
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword 
                  ? <FaEyeSlash size={20} /> 
                  : <FaEye size={20} />}
              </span>
            </div>
          </label>

          {mode === 'signup' && (
            <label>
              Parola (Tekrar)
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(v => !v)}
                >
                  {showConfirmPassword 
                    ? <FaEyeSlash size={20} /> 
                    : <FaEye size={20} />}
                </span>
              </div>
            </label>
          )}

          {message && <p className="auth-message">{message}</p>}

          <button type="submit" className="auth-button">
            {mode === 'signup' ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </form>

        <p className="switch-text">
          {mode === 'signup'
            ? 'Zaten hesabınız var mı?'
            : 'Hesabınız yok mu?'}
          <button
            className="switch-button"
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup');
              setMessage('');
            }}
          >
            {mode === 'signup' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </p>
      </div>
    </div>
);
}
