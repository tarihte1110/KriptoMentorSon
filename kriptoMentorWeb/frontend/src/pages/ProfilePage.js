// src/pages/ProfilePage.js

import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase }    from '../lib/supabaseClient';
import { avatarList }  from '../utils/avatars';
import { SignalsContext } from '../context/SignalsContext';
import './ProfilePage.css';
import { FaUserCircle }  from 'react-icons/fa';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { signals: allSignals } = useContext(SignalsContext);

  const [loading, setLoading]           = useState(true);
  const [user, setUser]                 = useState(null);
  const [profile, setProfile]           = useState(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // only for traders:
  const [followersCount, setFollowersCount] = useState(0);

  // only for investors:
  const [followedTraderIds, setFollowedTraderIds] = useState([]);
  const [followedTradersMap, setFollowedTradersMap] = useState({});

  useEffect(() => {
    (async () => {
      // 1) session
      const { data:{ session } } = await supabase.auth.getSession();
      const usr = session?.user;
      if (!usr) {
        navigate('/auth', { replace: true });
        return;
      }
      setUser(usr);

      // 2) load or create profile
      let { data: prof, error } = await supabase
        .from('profiles')
        .select('full_name,bio,avatar_url,created_at,user_type')
        .eq('user_id', usr.id)
        .maybeSingle();
      if (error) console.error(error);
      if (!prof) {
        const { data: np } = await supabase
          .from('profiles')
          .insert({
            user_id: usr.id,
            full_name: '',
            bio: '',
            avatar_url: '',
            user_type: 'investor'
          })
          .single();
        prof = np;
      }
      setProfile(prof);

      if (prof.user_type === 'trader') {
        // fetch only follower count
        const { count } = await supabase
          .from('follows')
          .select('*', { head:true, count:'exact' })
          .eq('trader_id', usr.id);
        setFollowersCount(count || 0);
      } else {
        // investor: fetch whom they follow
        const { data: follows } = await supabase
          .from('follows')
          .select('trader_id')
          .eq('investor_id', usr.id);
        const traderIds = (follows || []).map(f => f.trader_id);
        setFollowedTraderIds(traderIds);

        if (traderIds.length) {
          const { data: traders } = await supabase
            .from('profiles')
            .select('user_id,full_name')
            .in('user_id', traderIds);
          const map = {};
          traders.forEach(t => { map[t.user_id] = t.full_name; });
          setFollowedTradersMap(map);
        }
      }

      setLoading(false);
    })();
  }, [navigate]);

  const openLogoutModal = () => setLogoutModalVisible(true);
  const cancelLogout    = () => setLogoutModalVisible(false);
  const handleLogout    = async () => {
    await supabase.auth.signOut();
    navigate('/auth', { replace: true });
  };

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

  // choose signals to display
  const visibleSignals = profile.user_type === 'trader'
    ? allSignals.filter(s => s.userId === user.id)
    : allSignals.filter(s => followedTraderIds.includes(s.userId));

  return (
    <div className="profile-page">
      <div className="profile-header">
        {avatarSrc
          ? <img src={avatarSrc} alt="Avatar" className="avatar-img"/>
          : <div className="avatar-placeholder">👤</div>
        }
        <h2 className="profile-name">
          {profile.full_name || 'KriptoMentor Kullanıcısı'}
        </h2>
        <p className="profile-email">{user.email}</p>
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}
        <p className="profile-joined">Katılım: {joinedDate}</p>

        {profile.user_type === 'trader' && (
          <p
            className="followers-count-clickable"
            onClick={() => navigate(`/app/profile/${user.id}/followers`)}
          >
            Takipçi: {followersCount}
          </p>
        )}
      </div>

      <div className="profile-buttons">
        <button
          className="btn edit-btn"
          onClick={() => navigate('/app/edit-profile')}
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

      <h3 className="signals-title">
        {profile.user_type === 'investor'
          ? 'Takip Edilen Trader Gönderileri'
          : 'Paylaşılan Sinyaller'}
      </h3>

      {visibleSignals.length === 0 ? (
        <p className="empty-text">Henüz sinyal paylaşmadınız.</p>
      ) : (
        <ul className="signals-list">
          {visibleSignals.map(item => {
            // format date/time
            const d = new Date(item.timestamp);
            const dateStr = d.toLocaleDateString();
            const timeStr = d.toLocaleTimeString([], {
              hour:'2-digit',
              minute:'2-digit'
            });
            // trader name if investor
            const traderName = profile.user_type === 'investor'
              ? followedTradersMap[item.userId] || 'Anonim'
              : null;

            return (
              <li key={item.id} className="signal-card">
                {profile.user_type === 'investor' && (
                  <div className="user-row">
                    <FaUserCircle size={18} color="#1a73e8" />
                    <button
                      className="user-name"
                      onClick={() => navigate(`/app/profile/${item.userId}`)}
                    >
                      {traderName}
                    </button>
                  </div>
                )}
                <div className="header-row">
                  <h3 className="symbol">{item.symbol}</h3>
                  <small className="timestamp">{dateStr} {timeStr}</small>
                </div>
                <div className="meta-row">
                  <span className={`badge ${item.direction==='LONG'?'long':'short'}`}>
                    {item.direction}
                  </span>
                  <span className="badge timeframe">
                    {item.timeFrame?.toUpperCase()}
                  </span>
                </div>
                <div className="divider" />
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
                    <div key={i} className="row">
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

      {profile.user_type === 'trader' && (
        <button
          className="fab"
          onClick={() => navigate('/app/share-signal')}
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
