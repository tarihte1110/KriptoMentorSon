// src/screens/NewsScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Linking
} from 'react-native';
import Background from '../components/Background';
import { Ionicons } from '@expo/vector-icons';

const CRYPTOCOMPARE_API_KEY = 'c6e3282d291ebf97868cecaee2476ef79e9375cb8fc2af6f8ea47a21deea8638';

export default function NewsScreen() {
  const [articles, setArticles]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // api_key parametresi eklendi
      const url = `https://min-api.cryptocompare.com/data/v2/news/?lang=TR&api_key=${CRYPTOCOMPARE_API_KEY}`;
      const res  = await fetch(url);
      const json = await res.json();
      setArticles(json.Data || []);
    } catch (e) {
      console.error('Crypto haberleri çekme hatası:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNews();
  }, []);

  const renderItem = ({ item }) => {
    const date = new Date(item.published_on * 1000).toLocaleString('tr-TR', {
      day:   '2-digit',
      month: '2-digit',
      year:  'numeric',
      hour:  '2-digit',
      minute:'2-digit'
    });

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => Linking.openURL(item.url)}
      >
        {item.imageurl ? (
          <Image
            source={{ uri: item.imageurl }}
            style={styles.newsImage}
          />
        ) : null}
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.source}>{item.source}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        {item.body ? (
          <Text style={styles.description} numberOfLines={3}>
            {item.body}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <Ionicons name="chevron-forward-outline" size={20} color="#1a73e8" />
        </View>
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.header}>Kripto Haberleri</Text>
        <FlatList
          data={articles}
          keyExtractor={(item, i) => item.id || item.url || i.toString()}
          renderItem={renderItem}
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
  loader: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
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
    overflow: 'hidden',
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
  newsImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  source: {
    fontSize: 12,
    color: '#666'
  },
  date: {
    fontSize: 12,
    color: '#999'
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
});
