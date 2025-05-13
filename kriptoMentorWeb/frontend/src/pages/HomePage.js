// src/pages/HomePage.js

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate }            from 'react-router-dom';
import { SignalsContext }         from '../context/SignalsContext';
import { supabase }               from '../lib/supabaseClient';
import './HomePage.css';
import { FaThumbsUp, FaThumbsDown, FaComment, FaUserCircle } from 'react-icons/fa';

export default function HomePage() {
  const navigate    = useNavigate();
  const { signals } = useContext(SignalsContext);

  const [user, setUser]                     = useState(null);
  const [myProfileType, setMyProfileType]   = useState(null);
  const [profilesMap, setProfilesMap]       = useState({});
  const [reactionsMap, setReactionsMap]     = useState({});
  const [commentsCountMap, setCommentsCountMap] = useState({});
  const [loading, setLoading]               = useState(true);

  // 1) Oturum ve kendi profil tipini çek
  useEffect(() => {
    (async () => {
      const { data:{ session } } = await supabase.auth.getSession();
      const usr = session?.user;
      if (!usr) return;
      setUser(usr);

      // kendi profil tipini al
      const { data: prof } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', usr.id)
        .maybeSingle();
      setMyProfileType(prof?.user_type || null);
    })();
  }, []);

  // 2) Profiller, reaksiyonlar ve yorum sayıları
  useEffect(() => {
    if (!user || !signals.length) return;

    (async () => {
      setLoading(true);

      // profiller
      const { data: profs } = await supabase
        .from('profiles')
        .select('user_id, full_name');
      const pMap = {};
      profs.forEach(p => pMap[p.user_id] = p.full_name || 'Anonim');
      setProfilesMap(pMap);

      // reaksiyonlar
      const { data: reacts } = await supabase
        .from('reactions')
        .select('signal_id, user_id, type');
      const rMap = {};
      signals.forEach(s => rMap[s.id] = { likeCount:0, dislikeCount:0, myType:null });
      reacts.forEach(r => {
        const e = rMap[r.signal_id];
        if (!e) return;
        if (r.type === 'like')  e.likeCount++;
        else                     e.dislikeCount++;
        if (r.user_id === user.id) e.myType = r.type;
      });
      setReactionsMap(rMap);

      // yorum sayıları
      const { data: comms } = await supabase
        .from('comments')
        .select('signal_id');
      const cMap = {};
      signals.forEach(s => cMap[s.id] = 0);
      comms.forEach(c => {
        if (cMap[c.signal_id] !== undefined) cMap[c.signal_id]++;
      });
      setCommentsCountMap(cMap);

      setLoading(false);
    })();
  }, [user, signals]);

  // 3) Tepki handler (sadece investor ise)
  const handleReaction = async (signalId, type) => {
    if (myProfileType !== 'investor') return;
    const prev = reactionsMap[signalId]?.myType;
    if (prev === type) {
      await supabase
        .from('reactions')
        .delete()
        .match({ signal_id: signalId, user_id: user.id });
    } else if (prev) {
      await supabase
        .from('reactions')
        .update({ type })
        .match({ signal_id: signalId, user_id: user.id });
    } else {
      await supabase
        .from('reactions')
        .insert({ signal_id: signalId, user_id: user.id, type });
    }
    // yenile
    const { data: reacts } = await supabase
      .from('reactions')
      .select('signal_id, user_id, type');
    const rMap = {};
    signals.forEach(s => rMap[s.id] = { likeCount:0, dislikeCount:0, myType:null });
    reacts.forEach(r => {
      const e = rMap[r.signal_id];
      if (!e) return;
      if (r.type === 'like')  e.likeCount++;
      else                     e.dislikeCount++;
      if (r.user_id === user.id) e.myType = r.type;
    });
    setReactionsMap(rMap);
  };

  // 4) Yorum sayfasına git
  const goComments = (signalId) => {
    if (myProfileType !== 'investor') return;
    navigate(`/comments/${signalId}`);
  };

  // 5) Trader profiline git
  const goProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return <div className="home-page loader">Yükleniyor…</div>;
  }

  return (
    <div className="home-page">
      <ul className="signals-list">
        {signals.map(item => {
          const date = new Date(item.timestamp).toLocaleDateString();
          const time = new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
          const traderName = profilesMap[item.userId] || 'Anonim';
          const react = reactionsMap[item.id] || { likeCount:0, dislikeCount:0, myType:null };
          const commCount = commentsCountMap[item.id] || 0;

          return (
            <li key={item.id} className="signal-card">
              <div className="user-row">
                <FaUserCircle size={18} color="#1a73e8" />
                <button
                  className="user-name"
                  onClick={() => goProfile(item.userId)}
                >
                  {traderName}
                </button>
              </div>

              <div className="header-row">
                <h3 className="symbol">{item.symbol}</h3>
                <small className="timestamp">{date} {time}</small>
              </div>

              <div className="meta-row">
                <span className={`badge ${item.direction==='LONG'?'long':'short'}`}>
                  {item.direction}
                </span>
                <span className="badge timeframe">{item.timeFrame.toUpperCase()}</span>
              </div>

              <div className="divider" />

              <div className="row"><span>Entry Price</span><span>{item.entryPrice}</span></div>
              <div className="row"><span>Leverage</span><span>{item.recommendedLeverage}x</span></div>

              <div className="divider" />

              {item.targets.map((t,i) => (
                <div key={i} className="row">
                  <span>Target {i+1}</span>
                  <span className="target">{t}</span>
                </div>
              ))}

              <div className="row"><span>Stop Loss</span><span className="stop">{item.stopLoss}</span></div>
              
              <div className="divider" />

              <div className="actions-row">
                <button
                  className={`action-button like ${react.myType==='like'?'active':''}`}
                  onClick={()=>handleReaction(item.id,'like')}
                  disabled={myProfileType!=='investor'}
                >
                  <FaThumbsUp /> <span className="action-count">{react.likeCount}</span>
                </button>
                <button
                  className={`action-button dislike ${react.myType==='dislike'?'active':''}`}
                  onClick={()=>handleReaction(item.id,'dislike')}
                  disabled={myProfileType!=='investor'}
                >
                  <FaThumbsDown /> <span className="action-count">{react.dislikeCount}</span>
                </button>
                <button
                  className="action-button"
                  onClick={()=>goComments(item.id)}
                  disabled={myProfileType!=='investor'}
                >
                  <FaComment /> <span className="action-count">{commCount}</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
