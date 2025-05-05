import React from 'react';
import {
  SafeAreaView,
  Text,
  StyleSheet,
  Platform,
  StatusBar
} from 'react-native';
import Background from '../components/Background';

export default function HomeScreen() {
  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Ana Ekran</Text>
        <Text style={styles.subtitle}>
          Burada ileride bot sinyalleri gösterilecek.
        </Text>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight || 0) + 16
        : 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a73e8',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 16,
    color: '#666'
  }
});