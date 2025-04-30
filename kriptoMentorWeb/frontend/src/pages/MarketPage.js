import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MarketPage = () => {
  const [activeTab, setActiveTab] = useState('populer');

  return (
    <>
      <Header />
      <div className="market-container">
        <Sidebar />
        <main className="market-content">
          <div className="tabs">
            <button
              className={activeTab === 'populer' ? 'active' : ''}
              onClick={() => setActiveTab('populer')}
            >
              Popüler
            </button>
            <button
              className={activeTab === 'favoriler' ? 'active' : ''}
              onClick={() => setActiveTab('favoriler')}
            >
              Favoriler
            </button>
            <button
              className={activeTab === 'tum' ? 'active' : ''}
              onClick={() => setActiveTab('tum')}
            >
              Tüm Kriptolar
            </button>
          </div>
          <div className="market-layout">
            <aside className="filter-panel">
              <h3>Filtreler</h3>
              <div>
                <p>Piyasa Tipi</p>
                {/* Optionlar: Coin, Token, vb. */}
              </div>
              <div>
                <p>Artan / Düşen</p>
              </div>
              <div>
                <p>Hacim Filtreleri</p>
              </div>
            </aside>
            <section className="market-table">
              <table>
                <thead>
                  <tr>
                    <th>Coin</th>
                    <th>Fiyat</th>
                    <th>24s Değişim</th>
                    <th>Hacim</th>
                    <th>Favori</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>BTC</td>
                    <td>$50,000</td>
                    <td>+5%</td>
                    <td>$1B</td>
                    <td>★</td>
                  </tr>
                  <tr>
                    <td>ETH</td>
                    <td>$4,000</td>
                    <td>+3%</td>
                    <td>$500M</td>
                    <td>☆</td>
                  </tr>
                  {/* Ek satırlar eklenebilir */}
                </tbody>
              </table>
              <div className="detail-panel">
                <h3>Detaylar</h3>
                <div className="mini-chart">[Mini Grafik]</div>
                <p>Detaylı açıklama: Coin bilgileri, trendler vb.</p>
                <div className="action-buttons">
                  <button>İşlem Yap</button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default MarketPage;
