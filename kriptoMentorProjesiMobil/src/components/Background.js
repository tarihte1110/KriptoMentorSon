// src/components/Background.js
import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

export default function Background({ children }) {
  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.background}
      imageStyle={styles.image} 
      resizeMode="cover"
    >
      {/* Bir ekstra View ile içeriği overlay’in üstüne alıyoruz */}
      <View style={styles.overlay}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  image: {
    // Opaklık veya efekt vermek isterseniz
    opacity: 0.2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
