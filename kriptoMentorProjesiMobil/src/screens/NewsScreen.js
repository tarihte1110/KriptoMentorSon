// src/screens/NewsScreen.js

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar
} from 'react-native';
import Background from '../components/Background';

export default function NewsScreen() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Buraya gerçek haber API'nizi çağırın.
    // Şimdilik demo verisi:
    const demoNews = [
      {
        id: '1',
        title: 'Kripto Piyasası Yükseldi',
        summary: 'Bitcoin ve Ethereum bugün büyük artış kaydetti.'
      },
      {
        id: '2',
        title: 'Yeni Altcoin Dalgası',
        summary: 'SOL, ADA ve DOT gibi altcoinlerde hareketlilik sürüyor.'
      },
      {
        id: '3',
        title: 'Regülasyon Haberleri',
        summary: 'AB, kripto düzenlemeleri için adım atıyor.'
      }
    ];
    setNews(demoNews);
    setLoading(false);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.newsTitle}>{item.title}</Text>
      <Text style={styles.newsSummary}>{item.summary}</Text>
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
            data={news}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={
              news.length === 0 && styles.emptyContainer
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>Henüz haber bulunamadı.</Text>
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
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  },
  newsSummary: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  }
});
