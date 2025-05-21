// src/App.js

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

import LandingPage        from './pages/LandingPage';
import AuthPage           from './pages/AuthPage';
import HomePage           from './pages/HomePage';
import MarketPage         from './pages/MarketPage';
import NewsPage           from './pages/NewsPage';
import ProfilePage        from './pages/ProfilePage';
import EditProfilePage    from './pages/EditProfilePage';
import ShareSignalPage    from './pages/ShareSignalPage';
import CommentsPage       from './pages/CommentsPage';
import PublicProfilePage  from './pages/PublicProfilePage';
import FollowersPage      from './pages/FollowersPage';

import Header   from './components/Header';
import Sidebar  from './components/Sidebar';

import bgImage from './assets/images/background-page.png';
import './App.css';

function ProtectedLayout() {
  return (
    <div
      className="protected-layout"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize:     'cover',
        backgroundPosition: 'center',
        backgroundRepeat:   'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
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
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Grab initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    // Listen for auth changes
    const { data:{ subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign:'center', marginTop:100 }}>
        Yükleniyor…
      </div>
    );
  }

  return (
    <Routes>
      {/* PUBLIC */}
      <Route
        path="/"
        element={
          user
            ? <Navigate to="/app" replace />
            : <LandingPage />
        }
      />
      <Route path="/auth" element={<AuthPage />} />

      {/* PROTECTED */}
      <Route
        path="/app/*"
        element={
          user
            ? <ProtectedLayout />
            : <Navigate to="/" replace />
        }
      >
        <Route index element={<HomePage />} />
        <Route path="market"                element={<MarketPage />} />
        <Route path="news"                  element={<NewsPage />} />
        <Route path="profile"               element={<ProfilePage />} />
        <Route path="edit-profile"          element={<EditProfilePage />} />
        <Route path="share-signal"          element={<ShareSignalPage />} />
        <Route path="comments/:signalId"    element={<CommentsPage />} />
        <Route path="profile/:userId"       element={<PublicProfilePage />} />
        <Route path="profile/:userId/followers" element={<FollowersPage />} />
      </Route>

      {/* FALLBACK */}
      <Route
        path="*"
        element={
          user
            ? <Navigate to="/app" replace />
            : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
}
