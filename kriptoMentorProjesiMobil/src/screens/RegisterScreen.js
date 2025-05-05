// src/screens/RegisterScreen.js

import React, { useState } from 'react';
import {
  ImageBackground,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../api/supabase';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirm, setHideConfirm] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre alanları boş bırakılamaz.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Hata', 'Şifre ve onay şifresi eşleşmiyor.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Kayıt Hatası', error.message);
    } else {
      Alert.alert(
        'Başarılı',
        'Doğrulama mailinizi kontrol edin.',
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
          <Text style={styles.title}>Kayıt Ol</Text>

          <TextInput
            style={styles.input}
            placeholder="E-posta"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputFlex}
              placeholder="Şifre (en az 6 hane)"
              secureTextEntry={hidePassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setHidePassword(prev => !prev)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={hidePassword ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputFlex}
              placeholder="Şifreyi Onayla"
              secureTextEntry={hideConfirm}
              value={confirm}
              onChangeText={setConfirm}
            />
            <TouchableOpacity
              onPress={() => setHideConfirm(prev => !prev)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={hideConfirm ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabınız var mı?</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    alignSelf: 'center',
    color: '#1a73e8'   // tema rengine uygun mavi
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    marginBottom: 16,
  },
  inputFlex: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 4,
    marginRight: 8,
  },
  button: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#555',
  },
  footerLink: {
    color: '#1a73e8',
    fontWeight: 'bold',
  },
});
