// src/pages/ProfilePage.js

import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { avatarList } from '../utils/avatars';
import { SignalsContext } from '../context/SignalsContext';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { signals } = useContext(SignalsContext);

  const [loading, setLoading] = useState(true);
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const usr = session?.user;
      if (!usr) {
        navigate('/auth', { replace: true });
        return;
      }
      setUser(usr);

      let { data: prof, error } = await supabase
        .from('profiles')
        .select('full_name, bio, avatar_url, created_at, user_type')
        .eq('user_id', usr.id)
        .maybeSingle();
      if (error) console.error(error);

      if (!prof) {
        const { data: np, error: ie } = await supabase
          .from('profiles')
          .insert({
            user_id: usr.id,
            full_name: '',
            bio: '',
            avatar_url: '',
            user_type: 'investor'
          })
          .single();
        if (ie) console.error(ie);
        prof = np;
      }

      setProfile(prof);
      setLoading(false);
    };
    load();
  }, [navigate]);

  const openLogoutModal = () => setLogoutModalVisible(true);
  const cancelLogout    = () => setLogoutModalVisible(false);
  const handleLogout    = async () => {
    await supabase.auth.signOut();
    navigate('/auth', { replace: true });
  };

  const mySignals = (signals || []).filter(s => s.userId === user?.id);

  if (loading) {
    return (
      <div className="profile-page loader">
        <div className="spinner" />
      </div>
    );
  }

  const avatarItem = avatarList.find(a => a.id === profile.avatar_url);
  const avatarSrc  = avatarItem?.image;
  const joinedDate = new Date(profile.created_at).toLocaleDateString();

  return (
    <div className="profile-page">
      <div className="profile-header">
        {avatarSrc ? (
          <img src={avatarSrc} alt="Avatar" className="avatar-img" />
        ) : (
          <div className="avatar-placeholder">👤</div>
        )}
        <h2 className="profile-name">
          {profile.full_name || 'KriptoMentor Kullanıcısı'}
        </h2>
        <p className="profile-email">{user.email}</p>
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}
        <p className="profile-joined">Katılım: {joinedDate}</p>
      </div>

      <div className="profile-buttons">
        <button
          className="btn edit-btn"
          onClick={() => navigate('/edit-profile')}
        >
          Profili Düzenle
        </button>
        <button
          className="btn logout-btn"
          onClick={openLogoutModal}
        >
          Çıkış Yap
        </button>
      </div>

      <h3 className="signals-title">Paylaşılan Sinyaller</h3>
      {mySignals.length === 0 ? (
        <p className="empty-text">Henüz sinyal paylaşmadınız.</p>
      ) : (
        <ul className="signals-list">
          {mySignals.map(item => {
            const d = new Date(item.timestamp);
            const dateStr = d.toLocaleDateString();
            const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <li key={item.id} className="signal-card">
                <div className="card-header">
                  <span className="symbol">{item.symbol}</span>
                  <span className="timestamp">{dateStr} {timeStr}</span>
                </div>
                <div className="card-meta">
                  <span className={`badge ${item.direction === 'LONG' ? 'long' : 'short'}`}>
                    {item.direction}
                  </span>
                  <span className="badge timeframe">
                    {item.timeFrame?.toUpperCase()}
                  </span>
                </div>
                <div className="card-body">
                  <div className="row">
                    <span className="label">Entry Price</span>
                    <span className="value">{item.entryPrice}</span>
                  </div>
                  <div className="row">
                    <span className="label">Leverage</span>
                    <span className="value">{item.recommendedLeverage}x</span>
                  </div>
                  {item.targets.map((t, i) => (
                    <div className="row" key={i}>
                      <span className="label">Target {i + 1}</span>
                      <span className="value target">{t}</span>
                    </div>
                  ))}
                  <div className="row">
                    <span className="label">Stop Loss</span>
                    <span className="value stop">{item.stopLoss}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {profile.user_type === 'trader' && (
        <button
          className="fab"
          onClick={() => navigate('/share-signal')}
        >
          ＋
        </button>
      )}

      {logoutModalVisible && (
        <div className="modal-overlay" onClick={cancelLogout}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Çıkış Yap</h3>
            <p className="modal-message">Çıkış yapmak istediğinize emin misiniz?</p>
            <div className="modal-buttons">
              <button className="modal-btn cancel" onClick={cancelLogout}>
                İptal
              </button>
              <button className="modal-btn confirm" onClick={handleLogout}>
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
