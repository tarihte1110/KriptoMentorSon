// src/pages/FollowersPage.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase }    from '../lib/supabaseClient';
import { avatarList }  from '../utils/avatars';
import './FollowersPage.css';

export default function FollowersPage() {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      // 1) must be logged-in
      const { data:{ session } } = await supabase.auth.getSession();
      const usr = session?.user;
      if (!usr) return navigate('/auth', { replace:true });

      // 2) fetch all investor_ids who follow this trader
      const { data: rows, error: followsErr } = await supabase
        .from('follows')
        .select('investor_id')
        .eq('trader_id', usr.id);
      if (followsErr) {
        console.error(followsErr);
        setLoading(false);
        return;
      }

      const invIds = (rows||[]).map(r => r.investor_id);
      if (invIds.length) {
        // 3) get their profiles
        const { data: profs, error: profErr } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', invIds);
        if (profErr) console.error(profErr);
        setFollowers(profs || []);
      }

      setLoading(false);
    })();
  }, [navigate]);

  if (loading) {
    return <div className="followers-page loader">Yükleniyor…</div>;
  }

  return (
    <div className="followers-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Geri</button>
      <h2>Takipçileriniz</h2>
      {followers.length === 0 ? (
        <p className="empty">Henüz takipçiniz yok.</p>
      ) : (
        <ul className="followers-list">
          {followers.map(f => {
            const avatarItem = avatarList.find(a => a.id === f.avatar_url);
            const src = avatarItem?.image;
            return (
              <li key={f.user_id}>
                {src
                  ? <img src={src} alt="" className="follower-avatar"/>
                  : <div className="follower-avatar-placeholder">👤</div>
                }
                <span>{f.full_name || 'Anonim'}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
