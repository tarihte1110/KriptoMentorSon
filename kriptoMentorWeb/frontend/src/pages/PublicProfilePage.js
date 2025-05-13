// src/pages/PublicProfilePage.js

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate }     from 'react-router-dom';
import { supabase }                   from '../lib/supabaseClient';
import { avatarList }                 from '../utils/avatars';
import { SignalsContext }             from '../context/SignalsContext';
import './PublicProfilePage.css';

export default function PublicProfilePage() {
  const { userId } = useParams();
  const navigate   = useNavigate();
  const { signals: allSignals } = useContext(SignalsContext);

  const [profile, setProfile] = useState(null);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // 1) Profil verisini çek
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('full_name, bio, avatar_url, created_at')
        .eq('user_id', userId)
        .maybeSingle();
      if (profErr) {
        console.error(profErr);
        navigate('/', { replace: true });
        return;
      }
      setProfile(prof || { full_name: '', bio: '', avatar_url: '', created_at: new Date() });

      // 2) Sinyalleri SignalsContext'ten filtrele
      const userSignals = allSignals.filter(s => s.userId === userId);
      setSignals(userSignals);

      setLoading(false);
    };
    load();
  }, [userId, allSignals, navigate]);

  if (loading) {
    return <div className="public-profile loader">Yükleniyor…</div>;
  }

  // avatar kaynağı
  const avatarItem   = avatarList.find(a => a.id === profile.avatar_url);
  const avatarSrc    = avatarItem?.image;

  return (
    <div className="public-profile">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Geri
      </button>
      <div className="profile-header">
        {avatarSrc
          ? <img src={avatarSrc} alt="Avatar" className="avatar-img"/>
          : <div className="avatar-placeholder">👤</div>
        }
        <h2 className="name">{profile.full_name || 'KriptoMentor Kullanıcısı'}</h2>
        {profile.bio && <p className="bio">{profile.bio}</p>}
        <p className="joined">
          Katılım: {new Date(profile.created_at).toLocaleDateString()}
        </p>
      </div>

      <h3 className="signals-title">Paylaştığı Sinyaller</h3>
      {signals.length === 0 ? (
        <p className="empty">Henüz sinyal paylaşmamış.</p>
      ) : (
        <ul className="signals-list">
          {signals.map(item => {
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
                  {item.targets.map((t,i) => (
                    <div className="row" key={i}>
                      <span className="label">Target {i+1}</span>
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
    </div>
  );
}
