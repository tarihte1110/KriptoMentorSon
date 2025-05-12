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
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../api/supabase';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirm, setHideConfirm]   = useState(true);
  const [userType, setUserType]   = useState('investor'); // 'investor' veya 'trader'
  const [loading, setLoading]     = useState(false);

  const handleRegister = async () => {
    // 1) Zorunlu alanlar
    if (!username.trim() || !email.trim() || !password) {
      Alert.alert('Hata', 'Tüm alanları eksiksiz doldurun.');
      return;
    }
    // 2) Şifre kontrolü
    if (password !== confirm) {
      Alert.alert('Hata', 'Şifre ve onay şifresi eşleşmiyor.');
      return;
    }
    setLoading(true);

    // 3) Kullanıcı adı benzersiz mi?
    const { data: existing } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('full_name', username)
      .maybeSingle();
    if (existing) {
      setLoading(false);
      Alert.alert('Hata', 'Bu kullanıcı adı alınmış.');
      return;
    }

    // 4) Auth kaydı
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });
    if (signUpError) {
      setLoading(false);
      Alert.alert('Kayıt Hatası', signUpError.message);
      return;
    }

    // 5) profiles tablosuna ek
    const userId = data.user.id;
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        user_type: userType,
        full_name: username,
        bio: '',
        avatar_url: ''
      });
    setLoading(false);
    if (profileError) {
      Alert.alert('Profil Oluşturma Hatası', profileError.message);
      return;
    }

    Alert.alert(
      'Başarılı',
      'Lütfen e-postanıza gelen doğrulama linkine tıklayın.',
      [{ text: 'Tamam', onPress: () => navigation.navigate('Login') }]
    );
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
          <Image
            source={require('../../assets/logo-blue.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Kayıt Ol</Text>

          {/* Kullanıcı Türü */}
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                userType === 'investor' && styles.typeButtonActive
              ]}
              onPress={() => setUserType('investor')}
            >
              <Text
                style={[
                  styles.typeText,
                  userType === 'investor' && styles.typeTextActive
                ]}
              >
                Yatırımcı
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                userType === 'trader' && styles.typeButtonActive
              ]}
              onPress={() => setUserType('trader')}
            >
              <Text
                style={[
                  styles.typeText,
                  userType === 'trader' && styles.typeTextActive
                ]}
              >
                Trader
              </Text>
            </TouchableOpacity>
          </View>

          {/* Kullanıcı Adı */}
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı Adı"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

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
              placeholder="Şifre (min 6 karakter)"
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
  background: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: {
    flex: 1,
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight || 0) + 16
        : 16,
    paddingHorizontal: 24,
    justifyContent: 'center'
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 24
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    alignSelf: 'center',
    color: '#1a73e8'
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16
  },
  typeButton: {
    borderWidth: 1,
    borderColor: '#1a73e8',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 8
  },
  typeButtonActive: {
    backgroundColor: '#1a73e8'
  },
  typeText: {
    color: '#1a73e8',
    fontWeight: '600'
  },
  typeTextActive: {
    color: '#fff'
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    marginBottom: 16
  },
  inputFlex: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  eyeButton: {
    padding: 4,
    marginRight: 8
  },
  button: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32
  },
  footerText: {
    color: '#555'
  },
  footerLink: {
    color: '#1a73e8',
    fontWeight: 'bold'
  }
});
