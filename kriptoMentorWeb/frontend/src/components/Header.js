import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { avatarList } from '../utils/avatars';
import logo from '../assets/images/logo.png';
import './Header.css';

export default function Header() {
  const [avatarSrc, setAvatarSrc] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user;
      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();
        if (prof?.avatar_url) {
          const item = avatarList.find(a => a.id === prof.avatar_url);
          if (item) setAvatarSrc(item.image);
        }
      }
    });
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="KriptoMentor Logo" className="header-logo" />
      </div>
      <div className="header-center">
        <input
          type="text"
          className="search-input"
          placeholder="Arama..."
        />
      </div>
      <div className="header-right">
        <button className="notif-btn" title="Bildirimler">🔔</button>
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt="Kullanıcı Avatarı"
            className="header-avatar-img"
          />
        ) : (
          <div className="header-avatar-placeholder">👤</div>
        )}
      </div>
    </header>
  );
}
