import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <img
          src={logo}
          alt="KriptoMentor"
          className="landing-logo"
          onClick={() => navigate('/')}
        />
        <nav className="landing-nav">
          <button
            className="nav-btn login"
            onClick={() => navigate('/auth', { state: { mode: 'login' } })}
          >
            Giriş Yap
          </button>
          <button
            className="nav-btn signup"
            onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
          >
            Kayıt Ol
          </button>
        </nav>
      </header>

      <section className="hero">
        <h1>KriptoMentor’a Hoş Geldiniz</h1>
        <p>
          Gerçek zamanlı sinyaller, topluluk değerlendirmeleri ve en güncel haber akışıyla
          kripto dünyasında bir adım önde olun.
        </p>
        <div className="hero-cta">
          <button
            className="btn primary"
            onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
          >
            Hemen Başla
          </button>
          <button
            className="btn secondary"
            onClick={() => navigate('/auth', { state: { mode: 'login' } })}
          >
            Detaylı İncele
          </button>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <h3>Gerçek Zamanlı Sinyaller</h3>
          <p>Binance verileriyle desteklenen stratejik giriş ve çıkış noktaları.</p>
        </div>
        <div className="feature">
          <h3>Güven Temelli Topluluk</h3>
          <p>👍/👎 ve yorumlarla şeffaf trader değerlendirmeleri.</p>
        </div>
        <div className="feature">
          <h3>Haber Akışı</h3>
          <p>Dakika dakika güncellenen kripto haberleri elinizin altında.</p>
        </div>
        <div className="feature">
          <h3>Kripto Borsası Market Fiyatları</h3>
          <p>En güncel kripto para borsası fiyatlarını takip ederek piyasa hareketlerini anında yakalayın ve yatırım stratejilerinizi buna göre şekillendirin.</p>
        </div>
      </section>

      <footer className="landing-footer">
        © 2025 KriptoMentor. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
