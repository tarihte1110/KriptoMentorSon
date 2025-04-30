import React, { useState } from 'react';
import axios from 'axios';

const SignalCard = ({ signal }) => {
  const [likes, setLikes] = useState(signal.likes || 0);
  const [dislikes, setDislikes] = useState(signal.dislikes || 0);

  const handleVote = (type) => {
    if (type === 'like') {
      setLikes(likes + 1);
    } else {
      setDislikes(dislikes + 1);
    }
    // Şimdilik backend entegrasyonu yapılmadığı için bu kısım simüle ediliyor
    axios.post(`/api/signals/${signal.id}/vote`, { vote: type })
      .catch(error => {
        console.error('Oylama hatası:', error);
      });
  };

  return (
    <div className="signal-card">
      <h3>{signal.title}</h3>
      <p>{signal.description}</p>
      <div className="votes">
        <button onClick={() => handleVote('like')}>👍 {likes}</button>
        <button onClick={() => handleVote('dislike')}>👎 {dislikes}</button>
      </div>
    </div>
  );
};

export default SignalCard;
