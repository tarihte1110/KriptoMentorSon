// src/screens/PublicProfileScreen.js

import React, { useEffect, useState, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Background from '../components/Background';
import { supabase } from '../api/supabase';
import { avatarList } from '../utils/avatars';
import { SignalsContext } from '../context/SignalsContext';

export default function PublicProfileScreen({ route, navigation }) {
  const { userId } = route.params;
  const { signals: allSignals } = useContext(SignalsContext);
  const [profile, setProfile] = useState(null);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // Profil
      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name,bio,avatar_url,created_at')
        .eq('user_id', userId)
        .maybeSingle();
      setProfile(prof);

      // Sinyaller (tümünü context'ten alıp filtreliyoruz)
      const userSignals = allSignals.filter(s => s.userId === userId);
      setSignals(userSignals);
      setLoading(false);
    })();
  }, [userId, allSignals]);

  if (loading || !profile) {
    return (
      <Background>
        <SafeAreaView style={styles.loader}>
          <ActivityIndicator size="large" color="#1a73e8" />
        </SafeAreaView>
      </Background>
    );
  }

  const avatarItem = avatarList.find(a => a.id === profile.avatar_url);
  const avatarSource = avatarItem ? avatarItem.image : null;

  const renderCard = (item) => {
    const date = new Date(item.timestamp);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <View key={item.id} style={styles.card}>
        {/* Başlık */}
        <View style={styles.headerRow}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <View style={styles.timestampContainer}>
            <Text style={styles.dateText}>{dateStr}</Text>
            <Text style={styles.timeText}>{timeStr}</Text>
          </View>
        </View>

        {/* LONG/SHORT & Zaman Dilimi */}
        <View style={styles.metaRow}>
          <Text style={[
            styles.directionBadge,
            item.direction === 'LONG' ? styles.longBadge : styles.shortBadge
          ]}>
            {item.direction}
          </Text>
          <Text style={styles.timeBadge}>{item.timeFrame.toUpperCase()}</Text>
        </View>

        <View style={styles.divider} />

        {/* Entry & Leverage */}
        <View style={styles.row}>
          <Text style={styles.label}>Entry Price</Text>
          <Text style={styles.value}>{item.entryPrice}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Leverage</Text>
          <Text style={styles.value}>{item.recommendedLeverage}x</Text>
        </View>

        <View style={styles.divider} />

        {/* Targets */}
        {item.targets.map((t, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.label}>Target {i + 1}</Text>
            <Text style={[styles.value, styles.targetValue]}>{t}</Text>
          </View>
        ))}

        {/* Stop Loss */}
        <View style={styles.row}>
          <Text style={styles.label}>Stop Loss</Text>
          <Text style={[styles.value, styles.stopValue]}>{item.stopLoss}</Text>
        </View>
      </View>
    );
  };

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Profil Başlığı */}
          <View style={styles.profileHeader}>
            {avatarSource
              ? <Image source={avatarSource} style={styles.avatar} />
              : <Ionicons name="person-circle" size={120} color="#1a73e8" />
            }
            <Text style={styles.name}>{profile.full_name || 'KriptoMentor Kullanıcısı'}</Text>
            {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
            <Text style={styles.joined}>
              Katılım: {new Date(profile.created_at).toLocaleDateString()}
            </Text>
          </View>

          <Text style={styles.section}>Paylaştığı Sinyaller</Text>
          {signals.length === 0
            ? <Text style={styles.empty}>Henüz sinyal paylaşmamış.</Text>
            : signals.map(renderCard)
          }
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  loader:  { flex:1, justifyContent:'center', alignItems:'center' },
  container:{ flex:1, paddingTop: Platform.OS==='android'
      ? (StatusBar.currentHeight||0)+16
      :16 },

  profileHeader:{
    alignItems:'center', marginBottom:24
  },
  avatar:{ width:120, height:120, borderRadius:60, marginBottom:12 },
  name:{ fontSize:24, fontWeight:'700', marginBottom:4 },
  bio:{ fontSize:14, color:'#333', textAlign:'center', marginBottom:8, paddingHorizontal:16 },
  joined:{ fontSize:12, color:'#999' },

  section:{ fontSize:18, fontWeight:'700', marginBottom:12 },
  empty:{ textAlign:'center', color:'#666' },

  /* Aşağıdakiler HomeScreen’den birebir kopyalandı */
  card:{
    backgroundColor:'#fff',
    borderRadius:12,
    padding:20,
    marginBottom:16,
    ...Platform.select({
      ios:{
        shadowColor:'#000',
        shadowOffset:{width:0,height:2},
        shadowOpacity:0.1,
        shadowRadius:4
      },
      android:{ elevation:2 }
    })
  },
  headerRow:{ flexDirection:'row', justifyContent:'space-between' },
  symbol:{ fontSize:18, fontWeight:'700' },
  timestampContainer:{ alignItems:'flex-end' },
  dateText:{ fontSize:12, color:'#999' },
  timeText:{ fontSize:12, color:'#666', marginTop:2 },

  metaRow:{ flexDirection:'row', marginTop:8 },
  directionBadge:{
    paddingHorizontal:12, paddingVertical:4, borderRadius:12,
    fontSize:12, fontWeight:'700', marginRight:8
  },
  longBadge:{ backgroundColor:'#e6f4ea', color:'#34a853' },
  shortBadge:{ backgroundColor:'#fdecea', color:'#ea4335' },
  timeBadge:{
    paddingHorizontal:10, paddingVertical:4,
    borderRadius:12, backgroundColor:'#eef4ff', color:'#1a73e8',
    fontSize:12, fontWeight:'700'
  },

  divider:{ height:1, backgroundColor:'#eee', marginVertical:12 },
  row:{ flexDirection:'row', justifyContent:'space-between', marginBottom:8 },
  label:{ fontSize:14, color:'#555' },
  value:{ fontSize:14, fontWeight:'600', color:'#333' },
  targetValue:{ color:'#34a853' },
  stopValue:{ color:'#ea4335' },
});
