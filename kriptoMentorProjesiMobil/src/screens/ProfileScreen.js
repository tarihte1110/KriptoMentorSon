// src/screens/ProfileScreen.js

import React, { useEffect, useState, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../api/supabase';
import { avatarList } from '../utils/avatars';
import { SignalsContext } from '../context/SignalsContext';
import Background from '../components/Background';

export default function ProfileScreen({ navigation }) {
  const { signals } = useContext(SignalsContext);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // 1) session ve user al
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const user = sessionData.session?.user;
        if (!user) {
          // oturum yoksa girişe yönlendir
          navigation.replace('Login');
          return;
        }
        setUser(user);

        // 2) profile çek
        const { data: prof, error: profError } = await supabase
          .from('profiles')
          .select('full_name,bio,avatar_url,created_at,user_type')
          .eq('user_id', user.id)
          .maybeSingle();
        if (profError) throw profError;

        let profileRecord = prof;
        // 3) yoksa oluştur
        if (!prof) {
          const { data: np, error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              full_name: '',
              bio: '',
              avatar_url: '',
              user_type: 'investor'
            })
            .single();
          if (insertError) throw insertError;
          profileRecord = np;
        }
        setProfile(profileRecord);
      } catch (error) {
        console.error('Profil yükleme hatası:', error);
        Alert.alert('Hata', 'Profil bilgileri yüklenemedi.');
      }
    };

    load();
  }, [navigation]);

  if (!user || !profile) {
    return (
      <Background>
        <SafeAreaView style={styles.loader}>
          <ActivityIndicator size="large" color="#1a73e8" />
        </SafeAreaView>
      </Background>
    );
  }

  // avatar
  const avatarItem = avatarList.find(a => a.id === profile.avatar_url);
  const avatarSource = avatarItem ? avatarItem.image : null;
  const joinedDate = new Date(profile.created_at).toLocaleDateString();
  const mySignals = signals.filter(s => s.userId === user.id);

  const renderPost = ({ item }) => {
    const dateObj = new Date(item.timestamp);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <View style={styles.timestampContainer}>
            <Text style={styles.dateText}>{dateStr}</Text>
            <Text style={styles.timeText}>{timeStr}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={[
            styles.directionBadge,
            item.direction === 'LONG' ? styles.longBadge : styles.shortBadge
          ]}>
            {item.direction}
          </Text>
          <Text style={styles.timeBadge}>{(item.timeFrame||'').toUpperCase()}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Entry Price</Text>
          <Text style={styles.value}>{item.entryPrice}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Leverage</Text>
          <Text style={styles.value}>{item.recommendedLeverage}x</Text>
        </View>

        <View style={styles.divider} />

        {(item.targets||[]).map((t,i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.label}>Target {i+1}</Text>
            <Text style={[styles.value,styles.targetValue]}>{t}</Text>
          </View>
        ))}

        <View style={styles.row}>
          <Text style={styles.label}>Stop Loss</Text>
          <Text style={[styles.value,styles.stopValue]}>{item.stopLoss}</Text>
        </View>
      </View>
    );
  };

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <View style={styles.profileHeader}>
          {avatarSource
            ? <Image source={avatarSource} style={styles.avatar}/>
            : <Ionicons name="person-circle" size={120} color="#1a73e8"/>}
          <Text style={styles.name}>{profile.full_name||'KriptoMentor Kullanıcısı'}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
          <Text style={styles.joined}>Katılım: {joinedDate}</Text>
        </View>

        <TouchableOpacity
          style={[styles.btn,styles.editBtn]}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.btnText}>Profili Düzenle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn,styles.logoutBtn]}
          onPress={() => setLogoutModalVisible(true)}
        >
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

        <Text style={styles.section}>Paylaşılan Sinyaller</Text>
        {mySignals.length===0
          ? <Text style={styles.empty}>Henüz sinyal paylaşmadınız.</Text>
          : <FlatList
              data={mySignals}
              renderItem={renderPost}
              keyExtractor={i=>i.id}
              contentContainerStyle={{paddingBottom:40}}
            />
        }

        {profile.user_type==='trader' && (
          <TouchableOpacity
            style={styles.floating}
            onPress={()=>navigation.navigate('ShareSignal')}
          >
            <Ionicons name="add" size={32} color="#fff"/>
          </TouchableOpacity>
        )}

        <Modal
          visible={logoutModalVisible}
          transparent animationType="fade"
          onRequestClose={()=>setLogoutModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Çıkış Yap</Text>
              <Text style={styles.modalMessage}>
                Çıkış yapmak istediğinize emin misiniz?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={()=>setLogoutModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirm}
                  onPress={async()=>{
                    await supabase.auth.signOut();
                    setLogoutModalVisible(false);
                  }}
                >
                  <Text style={styles.modalConfirmText}>Çıkış Yap</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Background>
  );
}

const styles=StyleSheet.create({
  loader:{ flex:1,justifyContent:'center',alignItems:'center' },
  container:{
    flex:1,backgroundColor:'transparent',
    paddingTop: Platform.OS==='android'
      ? (StatusBar.currentHeight||0)+16
      :16
  },
  profileHeader:{ alignItems:'center',marginTop:16 },
  avatar:{ width:120,height:120,borderRadius:60,marginBottom:12 },
  name:{ fontSize:24,fontWeight:'700' },
  email:{ fontSize:16,color:'#666',marginTop:4 },
  bio:{ fontSize:14,color:'#333',marginTop:8,textAlign:'center',paddingHorizontal:16 },
  joined:{ fontSize:12,color:'#999',marginTop:4 },

  btn:{ marginHorizontal:32, borderRadius:8, height:48, justifyContent:'center', alignItems:'center', marginTop:16 },
  editBtn:{ backgroundColor:'#1a73e8' },
  logoutBtn:{ backgroundColor:'#fff', borderWidth:1, borderColor:'#1a73e8' },
  btnText:{ color:'#fff', fontWeight:'700' },
  logoutText:{ color:'#1a73e8', fontWeight:'700' },

  section:{ fontSize:18,fontWeight:'700',textAlign:'center',marginVertical:16 },
  empty:{ fontSize:14,color:'#666',textAlign:'center' },

  card:{
    backgroundColor:'#fff',alignSelf:'center',width:'90%',borderRadius:12,padding:20,marginVertical:10,
    ...Platform.select({
      ios:{ shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.1,shadowRadius:4 },
      android:{ elevation:2 }
    })
  },
  headerRow:{ flexDirection:'row',justifyContent:'space-between' },
  symbol:{ fontSize:18,fontWeight:'700' },
  timestampContainer:{ alignItems:'flex-end' },
  dateText:{ fontSize:12,color:'#999' },
  timeText:{ fontSize:12,color:'#666',marginTop:2 },

  metaRow:{ flexDirection:'row',marginTop:8 },
  directionBadge:{ paddingHorizontal:12,paddingVertical:4,borderRadius:12,fontSize:12,fontWeight:'700',marginRight:8 },
  longBadge:{ backgroundColor:'#e6f4ea',color:'#34a853' },
  shortBadge:{ backgroundColor:'#fdecea',color:'#ea4335' },
  timeBadge:{ paddingHorizontal:10,paddingVertical:4,borderRadius:12,backgroundColor:'#eef4ff',color:'#1a73e8',fontSize:12,fontWeight:'700' },

  divider:{ height:1,backgroundColor:'#eee',marginVertical:12 },
  row:{ flexDirection:'row',justifyContent:'space-between',marginBottom:8 },
  label:{ fontSize:14,color:'#555' },
  value:{ fontSize:14,fontWeight:'600',color:'#333' },
  targetValue:{ color:'#34a853' },
  stopValue:{ color:'#ea4335' },

  floating:{
    position:'absolute',bottom:24,right:24,backgroundColor:'#1a73e8',width:56,height:56,borderRadius:28,justifyContent:'center',alignItems:'center'
  },

  modalOverlay:{ flex:1,backgroundColor:'rgba(0,0,0,0.3)',justifyContent:'center',alignItems:'center' },
  modalBox:{ width:'80%',backgroundColor:'#fff',borderRadius:12,padding:20,alignItems:'center' },
  modalTitle:{ fontSize:18,fontWeight:'700',marginBottom:10 },
  modalMessage:{ fontSize:14,color:'#333',textAlign:'center',marginBottom:20 },
  modalButtons:{ flexDirection:'row',justifyContent:'flex-end',width:'100%' },
  modalCancel:{ paddingVertical:8,paddingHorizontal:12,marginRight:10 },
  modalCancelText:{ fontSize:14,color:'#1a73e8' },
  modalConfirm:{ paddingVertical:8,paddingHorizontal:12,backgroundColor:'#1a73e8',borderRadius:6 },
  modalConfirmText:{ fontSize:14,color:'#fff',fontWeight:'700' }
});
