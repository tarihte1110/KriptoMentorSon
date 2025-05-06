// src/pages/ShareSignalPage.js

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { SignalsContext } from '../context/SignalsContext';
import './ShareSignalPage.css';

export default function ShareSignalPage() {
  const navigate = useNavigate();
  const { addSignal } = useContext(SignalsContext);

  const [user, setUser] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return navigate('/auth');
      setUser(session.user);
    });
  }, [navigate]);

  const [symbol, setSymbol] = useState('ETHUSDT');
  const [direction, setDirection] = useState('LONG');
  const [timeFrame, setTimeFrame] = useState('1h');
  const [entryPrice, setEntryPrice] = useState('');
  const [leverage, setLeverage] = useState('');
  const [t1, setT1] = useState('');
  const [t2, setT2] = useState('');
  const [t3, setT3] = useState('');
  const [stopLoss, setStopLoss] = useState('');

  const handleSubmit = () => {
    if (!entryPrice || !leverage || !t1 || !t2 || !t3 || !stopLoss) {
      return alert('Lütfen tüm alanları doldurun.');
    }
    const now = new Date().toISOString();
    addSignal({
      userId: user.id,
      username: user.user_metadata.full_name || user.email,
      symbol,
      direction,
      timeFrame,
      entryPrice,
      recommendedLeverage: leverage,
      targets: [t1, t2, t3],
      stopLoss,
      timestamp: now
    });
    navigate(-1);
  };

  return (
    <div className="share-page">
      <h2>Sinyal Paylaş</h2>

      <label>
        Kripto Para
        <select value={symbol} onChange={e => setSymbol(e.target.value)}>
          <option>ETHUSDT</option>
          <option>BTCUSDT</option>
          <option>SOLUSDT</option>
          <option>BNBUSDT</option>
        </select>
      </label>

      <label>Pozisyon</label>
      <div className="btn-group">
        {['LONG','SHORT'].map(dir => (
          <button
            key={dir}
            className={direction===dir ? 'active' : ''}
            onClick={() => setDirection(dir)}
          >{dir}</button>
        ))}
      </div>

      <label>Zaman Aralığı</label>
      <div className="btn-group">
        {['5m','15m','30m','1h','2h','4h','6h'].map(tf => (
          <button
            key={tf}
            className={timeFrame===tf ? 'active tf' : ''}
            onClick={() => setTimeFrame(tf)}
          >{tf.toUpperCase()}</button>
        ))}
      </div>

      {[
        ['Entry Price', entryPrice, setEntryPrice],
        ['Leverage', leverage, setLeverage],
        ['Target 1', t1, setT1],
        ['Target 2', t2, setT2],
        ['Target 3', t3, setT3],
        ['Stop Loss', stopLoss, setStopLoss]
      ].map(([label,val,fn])=>(
        <label key={label}>
          {label}
          <input
            type="number"
            placeholder={`Örn. ${label}`}
            value={val}
            onChange={e=>fn(e.target.value)}
          />
        </label>
      ))}

      <button className="btn submit" onClick={handleSubmit}>
        Paylaş
      </button>
    </div>
  );
}
