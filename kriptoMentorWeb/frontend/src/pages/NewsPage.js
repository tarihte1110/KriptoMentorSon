import React, { useState, useEffect } from 'react';
import './NewsPage.css';

const CRYPTOCOMPARE_API_KEY = 'c6e3282d291ebf97868cecaee2476ef79e9375cb8fc2af6f8ea47a21deea8638';

export default function NewsPage() {
  const [articles, setArticles]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async () => {
    if (!refreshing) setLoading(true);
    try {
      const url = `https://min-api.cryptocompare.com/data/v2/news/?lang=TR&api_key=${CRYPTOCOMPARE_API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      setArticles(json.Data || []);
    } catch (e) {
      console.error('Haber çekme hatası:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);  
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  if (loading) {
    return (
      <div className="news-page loader">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="news-page">
      <div className="news-header-container">
        <h1 className="news-header">Kripto Haberleri</h1>
        <button className="refresh-btn" onClick={onRefresh} disabled={refreshing}>
          🔄
        </button>
      </div>
      <div className="news-list">
        {articles.map((item, idx) => {
          const date = new Date(item.published_on * 1000)
            .toLocaleString('tr-TR', {
              day:   '2-digit',
              month: '2-digit',
              year:  'numeric',
              hour:  '2-digit',
              minute:'2-digit'
            });
          return (
            <a
              key={idx}
              className="news-card"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.imageurl && (
                <img src={item.imageurl} alt="" className="news-image" />
              )}
              <h2 className="news-title">{item.title}</h2>
              <div className="news-meta">
                <span className="news-source">{item.source}</span>
                <span className="news-date">{date}</span>
              </div>
              {item.body && (
                <p className="news-description">
                  {item.body.length > 200
                    ? item.body.slice(0, 200) + '…'
                    : item.body}
                </p>
              )}
              <div className="news-footer">→</div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
