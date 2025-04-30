import React from 'react';

const NewsItem = ({ news }) => {
  return (
    <div className="news-item">
      <h3>{news.title}</h3>
      <p>{news.summary}</p>
      <a href={news.url} target="_blank" rel="noopener noreferrer">Devamını oku</a>
    </div>
  );
};

export default NewsItem;
