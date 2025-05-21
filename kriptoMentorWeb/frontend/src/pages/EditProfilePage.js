// src/pages/EditProfilePage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { avatarList } from '../utils/avatars';
import './EditProfilePage.css';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    const load = async () => {
      // 1) Oturumu al
      const { data: { session } } = await supabase.auth.getSession();
      const usr = session?.user;
      if (!usr) {
        navigate('/auth', { replace: true });
        return;
      }
      setUser(usr);

      // 2) Profili çek
      const { data: prof, error } = await supabase
        .from('profiles')
        .select('full_name,bio,avatar_url')
        .eq('user_id', usr.id)
        .maybeSingle();

      if (error) {
        console.error('Profil yüklerken hata:', error);
      } else if (prof) {
        setFullName(prof.full_name);
        setBio(prof.bio);
        setAvatar(prof.avatar_url);
      }
    };

    load();
  }, [navigate]);

  const handleSave = async () => {
    if (!user) return;

    // Sadece mevcut satırı güncelliyoruz
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        bio,
        avatar_url: avatar
      })
      .eq('user_id', user.id);

    if (error) {
      alert('Profil güncellenirken hata: ' + error.message);
    } else {
      // Başarılıysa profile sayfasına dön
      navigate('/profile');
    }
  };

  return (
    <div className="edit-profile-page">
      <h2>Profili Düzenle</h2>

      <label>
        Ad Soyad
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
        />
      </label>

      <label>
        Hakkımda
        <textarea
          rows="3"
          value={bio}
          onChange={e => setBio(e.target.value)}
        />
      </label>

      <div className="avatar-section">
        <p>Avatar Seçin</p>
        <div className="avatars-grid">
          {avatarList.map(a => (
            <img
              key={a.id}
              src={a.image}
              alt={a.id}
              className={avatar === a.id ? 'selected' : ''}
              onClick={() => setAvatar(a.id)}
            />
          ))}
        </div>
      </div>

      <div className="buttons">
        <button className="btn save" onClick={handleSave}>
          Kaydet
        </button>
        <button
          className="btn cancel"
          onClick={() => navigate('/profile')}
        >
          İptal
        </button>
      </div>
    </div>
  );
}
