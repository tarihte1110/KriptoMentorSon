import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo
} from 'react';
import './MarketPage.css';

const MarketItem = memo(({ item }) => {
  const isUp = item.price_change_percentage_24h >= 0;
  return (
    <div className="market-card">
      <div className="market-row">
        <span className="symbol">{item.symbol.toUpperCase()}</span>
        <span className="price">${item.current_price.toLocaleString()}</span>
      </div>
      <div className="market-row">
        <div className="market-cap">
          <span className="small-label">Market Cap:</span>
          <span className="small-value">
            ${item.market_cap.toLocaleString()}
          </span>
        </div>
        <div className="change-container">
          <span
            className={`arrow ${isUp ? 'up' : 'down'}`}
          >{isUp ? '▲' : '▼'}</span>
          <span className={`change-text ${isUp ? 'up' : 'down'}`}>
            {Math.abs(item.price_change_percentage_24h).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
});

export default function MarketPage() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  const pendingRef = useRef({});
  const timeoutRef = useRef(null);
  const wsRef = useRef(null);

  const fetchMarketData = async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets' +
        '?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&price_change_percentage=24h'
      );
      const data = await res.json();
      setCoins(data);
    } catch (err) {
      console.error('Market verisi hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const initWebSocket = useCallback((symbols) => {
    if (wsRef.current) wsRef.current.close();

    const streams = symbols.map(s => `${s.toLowerCase()}usdt@ticker`).join('/');
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = e => {
      const msg = JSON.parse(e.data).data;
      const sym = msg.s.replace('USDT', '').toLowerCase();
      pendingRef.current[sym] = {
        price: parseFloat(msg.c),
        change: parseFloat(msg.P)
      };

      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          setCoins(prev =>
            prev.map(c => {
              const upd = pendingRef.current[c.symbol.toLowerCase()];
              return upd
                ? {
                    ...c,
                    current_price: upd.price,
                    price_change_percentage_24h: upd.change
                  }
                : c;
            })
          );
          pendingRef.current = {};
          timeoutRef.current = null;
        }, 1000);
      }
    };

    ws.onerror = err => console.error('WS hata', err);
    ws.onclose = () => console.log('WS kapandı');
  }, []);

  useEffect(() => {
    fetchMarketData();
  }, []);

  useEffect(() => {
    if (coins.length) {
      initWebSocket(coins.map(c => c.symbol));
    }
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [coins, initWebSocket]);

  if (loading) {
    return (
      <div className="market-page loader">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="market-page">
      <h1 className="market-header">Güncel Piyasa Verileri</h1>
      <div className="market-list">
        {coins.map(coin => (
          <MarketItem key={coin.id} item={coin} />
        ))}
      </div>
    </div>
  );
}
