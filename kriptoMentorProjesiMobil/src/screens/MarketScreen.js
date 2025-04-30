// src/screens/MarketScreen.js

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import Background from '../components/Background';

export default function MarketScreen() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Gerçek API çağrınızı buraya ekleyin
    // Şimdilik demo verisi:
    const demo = [
      { id: 'BTCUSDT', symbol: 'BTC/USDT', price: '60,000', change: '+2.5%' },
      { id: 'ETHUSDT', symbol: 'ETH/USDT', price: '2,000', change: '-1.2%' },
      { id: 'SOLUSDT', symbol: 'SOL/USDT', price: '150', change: '+0.8%' },
      // … diğerleri
    ];
    setMarkets(demo);
    setLoading(false);
  }, []);

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.symbol}>{item.symbol}</Text>
        <Text
          style={[
            styles.change,
            item.change.startsWith('+') ? styles.up : styles.down
          ]}
        >
          {item.change}
        </Text>
      </View>
      <Text style={styles.price}>{item.price}</Text>
    </View>
  );

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#007BFF"
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={markets}
            renderItem={renderCard}
            keyExtractor={item => item.id}
            contentContainerStyle={
              markets.length === 0 && styles.emptyContainer
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>Piyasa verisi bulunamadı.</Text>
            }
          />
        )}
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',  // Arka plan Background tarafından sağlanıyor
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight || 0) + 16
        : 16
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#666'
  },
  card: {
    backgroundColor: '#fff',
    alignSelf: 'center',
    width: '90%',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      },
      android: {
        elevation: 2
      }
    })
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  change: {
    fontSize: 14
  },
  up: {
    color: 'green'
  },
  down: {
    color: 'red'
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right'
  }
});
