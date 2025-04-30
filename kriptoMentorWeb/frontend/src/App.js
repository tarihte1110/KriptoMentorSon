// src/App.js

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import MarketPage from './pages/MarketPage';
import NewsPage from './pages/NewsPage';
import ProfilePage from './pages/ProfilePage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

function ProtectedLayout() {
  // Header + Sidebar + alt sayfaları render eden genel şablon
  return (
    <>
      <Header />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '20px 30px' }}>
          <Outlet />
        </div>
      </div>
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // İlk oturum kontrolü
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    // Oturum değişimi dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, session) => { setUser(session?.user ?? null); }
    );
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div style={{ textAlign:'center', marginTop:100 }}>Yükleniyor…</div>;

  return (
    <Routes>
      {/* Public */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected */}
      <Route element={user ? <ProtectedLayout /> : <Navigate to="/auth" replace />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? "/" : "/auth"} replace />} />
    </Routes>
  );
}

export default App;
