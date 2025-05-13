// src/App.js

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import MarketPage from './pages/MarketPage';
import NewsPage from './pages/NewsPage';
import ProfilePage from './pages/ProfilePage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EditProfilePage from './pages/EditProfilePage';
import ShareSignalPage from './pages/ShareSignalPage';
import CommentsPage from './pages/CommentsPage';
import PublicProfilePage from './pages/PublicProfilePage';

import bgImage from './assets/images/background-page.png';
import './App.css';

function ProtectedLayout() {
  return (
    <div
      className="protected-layout"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
      }}
    >
      <Header />
      <div className="protected-content">
        <Sidebar />
        <div className="protected-page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // İlk oturum bilgisini al
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    // Oturum değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 100 }}>Yükleniyor…</div>;
  }

  return (
    <Routes>
      {/* Giriş/Kayıt */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Korumalı Alanlar */}
      <Route
        element={user ? <ProtectedLayout /> : <Navigate to="/auth" replace />}
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/share-signal" element={<ShareSignalPage />} />
        <Route path="/comments/:signalId" element={<CommentsPage />} />
        <Route path="/profile/:userId" element={<PublicProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to={user ? "/" : "/auth"} replace />}
      />
    </Routes>
  );
}
