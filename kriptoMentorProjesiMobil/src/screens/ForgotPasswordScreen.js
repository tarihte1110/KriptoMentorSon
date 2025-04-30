// src/screens/ForgotPasswordScreen.js

import React, { useState } from 'react';
import {
  ImageBackground,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { supabase } from '../api/supabase';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleReset = async () => {
    if (!email) {
      return Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
    }
    const { error } = await supabase.auth.resetPasswordForEmail({ email });
    if (error) {
      Alert.alert('Hata', error.message);
    } else {
      Alert.alert(
        'Başarılı',
        'Şifre sıfırlama bağlantısını içeren e-postayı gönderdik. Gelen kutunuzu kontrol edin.',
        [{ text: 'Tamam', onPress: () => navigation.navigate('Login') }]
      );
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/auth_background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Text style={styles.title}>Şifre Sıfırlama</Text>
          <TextInput
            style={styles.input}
            placeholder="E-posta adresiniz"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity style={styles.button} onPress={handleReset}>
            <Text style={styles.buttonText}>Gönder</Text>
          </TouchableOpacity>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabınıza döndünüz mü?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}> Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight || 0) + 16
        : 16,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    alignSelf: 'center',
    color: '#333'
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#555'
  },
  footerLink: {
    color: '#007BFF',
    fontWeight: 'bold'
  }
});
