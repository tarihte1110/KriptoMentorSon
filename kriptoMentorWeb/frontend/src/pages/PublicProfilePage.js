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

  const [currentUser, setCurrentUser]   = useState(null);
  const [currentType, setCurrentType]   = useState(null);
  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);

  // follow state
  const [followCount, setFollowCount]     = useState(0);
  const [isFollowing, setIsFollowing]     = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  // 1) load session + user_type of current user
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const usr = session?.user;
      if (usr) {
        setCurrentUser(usr);
        const { data: prof } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', usr.id)
          .maybeSingle();
        setCurrentType(prof?.user_type ?? null);
      }
    });
  }, []);

  // 2) load public profile
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    supabase
      .from('profiles')
      .select('user_type,full_name,bio,avatar_url,created_at')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error || !data) {
          navigate('/app', { replace: true });
        } else {
          setProfile(data);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [userId, navigate]);

  // 3) load follow count & my follow status
  useEffect(() => {
    if (!profile) return;
    // count
    supabase
      .from('follows')
      .select('investor_id', { count: 'exact', head: true })
      .eq('trader_id', userId)
      .then(({ count }) => setFollowCount(count || 0));

    // am I following?
    if (currentUser && currentType === 'investor') {
      supabase
        .from('follows')
        .select('*')
        .match({ trader_id: userId, investor_id: currentUser.id })
        .maybeSingle()
        .then(({ data }) => setIsFollowing(!!data));
    }
  }, [profile, currentUser, currentType, userId]);

  // 4) load full follower list (only for the trader themself)
  useEffect(() => {
    if (!currentUser || currentUser.id !== userId) return;
    setLoadingFollowers(true);
    supabase
      .from('follows')
      .select('investor_id')
      .eq('trader_id', userId)
      .then(async ({ data, error }) => {
        if (error) throw error;
        const ids = data.map(r => r.investor_id);
        if (ids.length) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('user_id,full_name,avatar_url')
            .in('user_id', ids);
          setFollowersList(profs);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingFollowers(false));
  }, [currentUser, userId]);

  const handleFollowToggle = async () => {
    if (!currentUser || currentType !== 'investor') return;
    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .match({ trader_id: userId, investor_id: currentUser.id });
      setFollowCount(c => c - 1);
    } else {
      await supabase
        .from('follows')
        .insert({ trader_id: userId, investor_id: currentUser.id });
      setFollowCount(c => c + 1);
    }
    setIsFollowing(f => !f);
  };

  const userSignals = allSignals.filter(s => s.userId === userId);

  if (loading) {
    return <div className="public-profile loader">Yükleniyor…</div>;
  }

  // avatar
  const avatarItem = avatarList.find(a => a.id === profile.avatar_url);
  const avatarSrc  = avatarItem?.image;

  return (
    <div className="public-profile">
      <button className="back-btn" onClick={() => navigate(-1)}>← Geri</button>

      <div className="profile-header">
        {avatarSrc
          ? <img src={avatarSrc} alt="Avatar" className="avatar-img" />
          : <div className="avatar-placeholder">👤</div>
        }

        <h2 className="name">
          {profile.full_name || 'KriptoMentor Kullanıcısı'}
        </h2>
        {profile.bio && <p className="bio">{profile.bio}</p>}
        <p className="joined">
          Katılım: {new Date(profile.created_at).toLocaleDateString()}
        </p>

        {profile.user_type === 'trader' && currentType === 'investor' && (
          <button
            className={`follow-btn ${isFollowing ? 'unfollow' : 'follow'}`}
            onClick={handleFollowToggle}
          >
            {isFollowing ? 'Takibi Bırak' : 'Takip Et'}
          </button>
        )}

        {profile.user_type === 'trader' && (
          <div
            className="follower-count-clickable"
            onClick={() => navigate(`/app/profile/${userId}/followers`)}
          >
            Takipçi: {followCount}
          </div>
        )}
      </div>

      {currentUser?.id === userId && (
        <div className="followers-list">
          <h3>Takipçileriniz</h3>
          {loadingFollowers
            ? <p>Yükleniyor…</p>
            : followersList.map(f => {
                const av = avatarList.find(a => a.id === f.avatar_url)?.image;
                return (
                  <div key={f.user_id} className="follower-item">
                    {av
                      ? <img src={av} alt="" className="follower-avatar" />
                      : <div className="follower-avatar-placeholder">👤</div>
                    }
                    <span>{f.full_name || 'Anonim'}</span>
                  </div>
                );
              })
          }
        </div>
      )}

      <h3 className="signals-title">Paylaştığı Sinyaller</h3>
      {userSignals.length === 0 ? (
        <p className="empty">Henüz sinyal paylaşmamış.</p>
      ) : (
        <ul className="signals-list">
          {userSignals.map(item => {
            const d = new Date(item.timestamp);
            const dateStr = d.toLocaleDateString();
            const timeStr = d.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });
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
                  <div className="divider" />
                  {item.targets.map((t, i) => (
                    <div key={i} className="row">
                      <span className="label">Target {i+1}</span>
                      <span className="value target">{t}</span>
                    </div>
                  ))}
                  <div className="divider" />
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
