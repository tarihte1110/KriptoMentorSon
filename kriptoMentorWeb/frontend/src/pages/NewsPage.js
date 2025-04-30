import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NewsPage = () => {
  return (
    <>
      <Header />
      <div className="news-container">
        <Sidebar />
        <main className="news-content">
          <div className="news-header">
            <h2>Güncel Kripto Haberleri</h2>
          </div>
          <div className="news-layout">
            <section className="news-cards">
              <div className="news-card">
                <img src="https://via.placeholder.com/300x150" alt="Haber Görseli" />
                <h3>BTC Fiyatında Hareketlenme</h3>
                <p className="news-date">08 Nisan 2025</p>
                <p className="news-summary">
                  Bitcoin fiyatlarında son günlerde önemli hareketlenmeler gözlemleniyor...
                </p>
                <button>Devamını Oku</button>
              </div>
              {/* Daha fazla haber kartı eklenebilir */}
            </section>
            <aside className="news-right-panel">
              <h3>Popüler Etiketler</h3>
              <ul className="tags">
                <li>NFT</li>
                <li>DeFi</li>
                <li>Regülasyonlar</li>
              </ul>
              <div className="news-search">
                <input type="text" placeholder="Haber ara..." />
              </div>
            </aside>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default NewsPage;
