import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const getActiveClass = (path) => (location.pathname === path ? 'active' : '');

  return (
    <aside className="sidebar">
      <ul>
        <li className={getActiveClass('/')}>
          <Link to="/">Ana Sayfa</Link>
        </li>
        <li className={getActiveClass('/market')}>
          <Link to="/market">Piyasa</Link>
        </li>
        <li className={getActiveClass('/news')}>
          <Link to="/news">Haberler</Link>
        </li>
        <li className={getActiveClass('/profile')}>
          <Link to="/profile">Profil</Link>
        </li>
        <li>
          <button className="theme-toggle">Tema Değiştirici</button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
