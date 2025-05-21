// src/components/Sidebar.js

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaChartLine, 
  FaRegNewspaper, 
  FaUser 
} from 'react-icons/fa';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <ul>
        <li>
          <NavLink
            to="/app"
            end
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <FaHome className="icon" />
            Ana Sayfa
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/app/market"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <FaChartLine className="icon" />
            Piyasa
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/app/news"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <FaRegNewspaper className="icon" />
            Haberler
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/app/profile"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <FaUser className="icon" />
            Profil
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
