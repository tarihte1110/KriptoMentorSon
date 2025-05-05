// src/screens/MarketScreen.js

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  memo
} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Background from '../components/Background';
import { Ionicons } from '@expo/vector-icons';


// Tek bir coin kartı, ancak props.item değiştiğinde yeniden render
const MarketItem = memo(({ item }) => {
  const isUp = item.price_change_percentage_24h >= 0;
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.symbol}>{item.symbol.toUpperCase()}</Text>
        <Text style={styles.price}>${item.current_price.toLocaleString()}</Text>
      </View>
      <View style={styles.row}>
        <View style={styles.marketCap}>
          <Text style={styles.smallLabel}>Market Cap:</Text>
          <Text style={styles.smallValue}>
            ${item.market_cap.toLocaleString()}
          </Text>
        </View>
        <View style={styles.changeContainer}>
          <Ionicons
            name={isUp ? 'arrow-up' : 'arrow-down'}
            size={14}
            color={isUp ? '#34a853' : '#ea4335'}
          />
          <Text style={[styles.changeText, isUp ? styles.up : styles.down]}>
            {Math.abs(item.price_change_percentage_24h).toFixed(2)}%
          </Text>
        </View>
      </View>
    </View>
  );
});


export default function MarketScreen() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const pendingUpdatesRef = useRef({});      // Gelen WS güncellemelerini biriktirir
  const updateTimeoutRef  = useRef(null);    // Batching için timeout ID
  const wsRef             = useRef(null);    // WebSocket referansı

  // 1) CoinGecko'dan ilk listeyi çek
  const fetchMarketData = async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets' +
        '?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&price_change_percentage=24h'
      );
      const data = await res.json();
      setCoins(data);
    } catch (err) {
      console.error('Market verisi çekme hatası:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 2) WS bağlantısını ve batch mekanizmasını kur
  const initWebSocket = useCallback((symbols) => {
    // Eski bağlantıyı kapat
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Binance combined stream URL
    const streams = symbols
      .map((s) => `${s.toLowerCase()}usdt@ticker`)
      .join('/');
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    const ws  = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const d   = msg.data;
      const sym = d.s.replace('USDT', '').toLowerCase();
      const price  = parseFloat(d.c);
      const change = parseFloat(d.P);

      // Batch: sadece objeye ekle
      pendingUpdatesRef.current[sym] = { price, change };

      // Eğer henüz timeout kurulu değilse, 1s sonra uygulamaya geçir
      if (!updateTimeoutRef.current) {
        updateTimeoutRef.current = setTimeout(() => {
          setCoins(prev =>
            prev.map(c => {
              const upd = pendingUpdatesRef.current[c.symbol];
              return upd
                ? {
                    ...c,
                    current_price: upd.price,
                    price_change_percentage_24h: upd.change
                  }
                : c;
            })
          );
          // Temizle
          pendingUpdatesRef.current = {};
          updateTimeoutRef.current = null;
        }, 1000);
      }
    };

    ws.onerror = e => console.error('WS hata', e.message);
    ws.onclose = () => console.log('WS bağlantısı kapandı');
  }, []);

  // İlk yüklemede sadece bir kere çalışsın
  useEffect(() => {
    fetchMarketData();
  }, []);

  // coins ilk geldiğinde bir kez WS başlat
  useEffect(() => {
    if (coins.length > 0) {
      const syms = coins.map(c => c.symbol);
      initWebSocket(syms);
    }
    return () => {
      // Unmount veya navigasyon değişiminde WS kapanır
      if (wsRef.current) {
        wsRef.current.close();
      }
      // Timeout varsa iptal et
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [coins, initWebSocket]);

  // Pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMarketData();
  }, []);

  // RenderItem memo ve useCallback ile
  const renderItem = useCallback(
    ({ item }) => <MarketItem item={item} />,
    []
  );

  // Ortalama her kart ~80px: hızlı scroll

  const getItemLayout = useCallback(
    (_, index) => ({ length: 88, offset: 88 * index, index }),
    []
  );

  if (loading) {
    return (
      <Background>
        <SafeAreaView style={styles.loader}>
          <ActivityIndicator size="large" color="#1a73e8" />
        </SafeAreaView>
      </Background>
    );
  }

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Piyasa Verileri</Text>
        <FlatList
          data={coins}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={11}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor="#1a73e8"
              onRefresh={onRefresh}
            />
          }
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      </SafeAreaView>
    </Background>
  );
}


const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: {
    flex: 1,
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight || 0) + 16
        : 16,
    paddingHorizontal: 16
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a73e8',
    marginBottom: 12,
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    height: 88,  // getItemLayout ile uyumlu
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      },
      android: { elevation: 2 }
    })
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  symbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a73e8'
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  marketCap: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  smallLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4
  },
  smallValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600'
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  changeText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4
  },
  up: {
    color: '#34a853'
  },
  down: {
    color: '#ea4335'
  }
});
