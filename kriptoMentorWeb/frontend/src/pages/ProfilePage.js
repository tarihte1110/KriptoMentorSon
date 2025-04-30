// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { signOut, getUser } from '../services/auth';
import './ProfilePage.css';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await getUser();
        if (user) {
          setProfile({
            email: user.email,
            id: user.id,
            confirmed: Boolean(user.email_confirmed_at),
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) return <div className="profile-container"><p>Profil yükleniyor…</p></div>;
  if (!profile) return <div className="profile-container"><p>Kullanıcı bulunamadı.</p></div>;

  return (
    <div className="profile-container">
      <div className="profile-box">
        <h2>Profil Bilgileri</h2>
        <p><strong>E‑posta:</strong> {profile.email}</p>
        <p>
          <strong>Onay Durumu:</strong>{' '}
          {profile.confirmed ? 'Onaylı ✅' : 'Onaysız ❌'}
        </p>
        <button className="signout-button" onClick={async () => {
          await signOut();
          window.location.href = '/auth';
        }}>
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}
