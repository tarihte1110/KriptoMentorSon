// src/screens/EditProfileScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import { supabase } from '../api/supabase';
import { avatarList } from '../utils/avatars';

export default function EditProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, bio, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) {
        console.error('Profil çekme hatası:', error);
      }
      if (profile) {
        setName(profile.full_name);
        setBio(profile.bio);
        setSelectedAvatar(profile.avatar_url);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Hata', 'Kullanıcı bilgisi yüklenemedi.');
      return;
    }
    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: user.id,
          full_name: name,
          bio,
          avatar_url: selectedAvatar,
        },
        { onConflict: 'user_id' }
      );
    if (error) {
      Alert.alert('Hata', error.message);
    } else {
      Alert.alert('Başarılı', 'Profil güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    }
  };

  const renderAvatar = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.avatarOption,
        selectedAvatar === item.id && styles.avatarSelected,
      ]}
      onPress={() => setSelectedAvatar(item.id)}
    >
      <Image source={item.image} style={styles.avatarImage} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ad Soyad</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ad Soyad"
      />

      <Text style={styles.label}>Hakkımda</Text>
      <TextInput
        style={[styles.input, styles.bioInput]}
        value={bio}
        onChangeText={setBio}
        placeholder="Kısa bir bio girin"
        multiline
      />

      <Text style={styles.label}>Avatar Seçin</Text>
      <FlatList
        data={avatarList}
        renderItem={renderAvatar}
        keyExtractor={(item) => item.id}
        numColumns={5}
        style={styles.avatarList}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
  },
  bioInput: {
    height: 80,
  },
  avatarList: {
    marginBottom: 24,
  },
  avatarOption: {
    flex: 1,
    alignItems: 'center',
    margin: 4,
    padding: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  avatarSelected: {
    borderColor: '#007BFF',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
