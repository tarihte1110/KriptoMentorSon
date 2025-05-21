// src/pages/AuthPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../services/auth';
import { supabase } from '../lib/supabaseClient';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../assets/images/logo-blue.png';     // ← Logonuzun adı neyse buraya yazın
import './AuthPage.css';

export default function AuthPage() {
  const [mode, setMode]                 = useState('login');      // 'login' veya 'signup'
  const [userType, setUserType]         = useState('investor');  // 'investor' veya 'trader'
  const [username, setUsername]         = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [message, setMessage]           = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    if (mode === 'signup') {
      if (!username.trim() || !email.trim() || !password) {
        setMessage('Lütfen tüm alanları doldurun.');
        return;
      }
      if (password !== confirmPassword) {
        setMessage('Parolalar eşleşmiyor!');
        return;
      }
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setMessage(signUpError.message);
        return;
      }
      const userId = data.user.id;
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          user_type: userType,
          full_name: username,
          bio: '',
          avatar_url: ''
        });
      if (profileError) {
        setMessage(profileError.message);
        return;
      }
      setMessage('Kayıt başarılı! Lütfen e-postanızı onaylayın.');
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setMessage(error.message);
      } else {
        navigate('/app', { replace: true });
      }
    }
  };

  return (
    <div className="auth-container">
      {/*— LOGO —*/}
      <img src={logo} alt="KriptoMentor Logo" className="auth-logo" />

      <div className="auth-box">
        <h2>{mode === 'signup' ? 'Kayıt Ol' : 'KriptoMentor Giriş'}</h2>

        {mode === 'signup' && (
          <div className="user-type-container">
            <button
              type="button"
              className={`type-button ${userType==='investor' ? 'active' : ''}`}
              onClick={() => setUserType('investor')}
            >
              Yatırımcı
            </button>
            <button
              type="button"
              className={`type-button ${userType==='trader' ? 'active' : ''}`}
              onClick={() => setUserType('trader')}
            >
              Trader
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label>
              Kullanıcı Adı
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </label>
          )}

          <label>
            E-posta
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Parola
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </label>

          {mode === 'signup' && (
            <label>
              Parola (Tekrar)
              <div className="password-wrapper">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowConfirm(v => !v)}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
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
              setMode(m => m==='signup' ? 'login' : 'signup');
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
