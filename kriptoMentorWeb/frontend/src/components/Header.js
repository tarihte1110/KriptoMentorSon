// src/components/Header.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { avatarList } from '../utils/avatars';
import logo from '../assets/images/logo.png';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [searchText, setSearchText] = useState('');

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

  const handleKeyDown = async (e) => {
    if (e.key !== 'Enter') return;
    const q = searchText.trim();
    if (q.startsWith('@')) {
      const name = q.slice(1).trim();
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('full_name', name)
        .eq('user_type', 'trader')
        .maybeSingle();
      if (error) {
        console.error(error);
        alert('Bir hata oluştu.');
      } else if (!data) {
        alert(`"${name}" adlı trader bulunamadı.`);
      } else {
        // Mutlaka /app/profile/:userId rotasına yönlendir
        navigate(`/app/profile/${data.user_id}`);
        setSearchText('');
      }
    }
    // Başka arama mantıkları eklenirse buraya...
  };

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
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
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
