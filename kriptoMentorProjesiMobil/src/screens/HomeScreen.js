// src/screens/HomeScreen.js

import React, { useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Image,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Background from '../components/Background';
import { SignalsContext } from '../context/SignalsContext';
import { supabase } from '../api/supabase';

export default function HomeScreen({ navigation }) {
  const { signals } = useContext(SignalsContext);
  const [user, setUser] = useState(null);
  const [profilesMap, setProfilesMap] = useState({});
  const [reactionsMap, setReactionsMap] = useState({});
  const [commentsCountMap, setCommentsCountMap] = useState({});
  const [loading, setLoading] = useState(true);

  // arama çubuğu için state
  const [searchText, setSearchText] = useState('');

  // 1) Oturumlu user
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user);
    })();
  }, []);

  // 2) Verileri çek
  useEffect(() => {
    if (!signals.length || !user) return;

    const fetchAll = async () => {
      setLoading(true);
      // profiller
      const { data: profs } = await supabase.from('profiles').select('user_id, full_name');
      const pMap = {};
      profs.forEach(p => pMap[p.user_id] = p.full_name || 'KriptoMentor');
      setProfilesMap(pMap);
      // reaksiyonlar
      const { data: reacts } = await supabase.from('reactions').select('signal_id, user_id, type');
      const rMap = {};
      signals.forEach(s => rMap[s.id] = { likeCount: 0, dislikeCount: 0, myType: null });
      reacts.forEach(r => {
        const e = rMap[r.signal_id];
        if (!e) return;
        if (r.type === 'like') e.likeCount++;
        else e.dislikeCount++;
        if (r.user_id === user.id) e.myType = r.type;
      });
      setReactionsMap(rMap);
      // yorum sayıları
      const { data: comms } = await supabase.from('comments').select('signal_id');
      const cCount = {};
      signals.forEach(s => cCount[s.id] = 0);
      comms.forEach(c => { if (cCount[c.signal_id] !== undefined) cCount[c.signal_id]++; });
      setCommentsCountMap(cCount);
      setLoading(false);
    };

    fetchAll();
  }, [signals, user]);

  // 3) Reaction handler
  const handleReaction = async (signalId, type) => {
    const prev = reactionsMap[signalId]?.myType;
    if (prev === type) {
      await supabase.from('reactions').delete().match({ signal_id: signalId, user_id: user.id });
    } else if (prev) {
      await supabase.from('reactions').update({ type }).match({ signal_id: signalId, user_id: user.id });
    } else {
      await supabase.from('reactions').insert({ signal_id: signalId, user_id: user.id, type });
    }
    // yenile
    const { data: reacts } = await supabase.from('reactions').select('signal_id, user_id, type');
    const rMap = {};
    signals.forEach(s => rMap[s.id] = { likeCount: 0, dislikeCount: 0, myType: null });
    reacts.forEach(r => {
      const e = rMap[r.signal_id];
      if (!e) return;
      if (r.type === 'like') e.likeCount++;
      else e.dislikeCount++;
      if (r.user_id === user.id) e.myType = r.type;
    });
    setReactionsMap(rMap);
  };

  // 4) Yorum ekranına git
  const onPressComments = id => navigation.navigate('Comments', { signalId: id });

  // 5) Arama işlemi
  const onSearch = async () => {
    if (searchText.startsWith('@')) {
      const name = searchText.slice(1).trim();
      const { data: profs, error } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('full_name', name)
        .eq('user_type', 'trader')
        .maybeSingle();
      if (error || !profs) {
        Alert.alert('Kullanıcı bulunamadı', `"${name}" adlı trader bulunamadı.`);
      } else {
        navigation.navigate('PublicProfile', { userId: profs.user_id });
      }
    }
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

  // sinyalleri aramaya göre filtrele (sembol bazlı)
  const filteredSignals = searchText.startsWith('@')
    ? signals
    : signals.filter(s => s.symbol.toLowerCase().includes(searchText.toLowerCase()));

  const renderItem = ({ item }) => {
    const date = new Date(item.timestamp);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const username = profilesMap[item.userId] || 'KriptoMentor';
    const r = reactionsMap[item.id] || { likeCount: 0, dislikeCount: 0, myType: null };
    const cCount = commentsCountMap[item.id] || 0;

    return (
      <View style={styles.card}>
        <View style={styles.userRow}>
          <Ionicons name="person-circle" size={18} color="#1a73e8" />
          <Text style={styles.username}>{username}</Text>
        </View>
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
            item.direction==='LONG'?styles.longBadge:styles.shortBadge
          ]}>{item.direction}</Text>
          <Text style={styles.timeBadge}>{item.timeFrame.toUpperCase()}</Text>
        </View>
        <View style={styles.divider}/>
        <View style={styles.row}>
          <Text style={styles.label}>Entry Price</Text>
          <Text style={styles.value}>{item.entryPrice}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Leverage</Text>
          <Text style={styles.value}>{item.recommendedLeverage}x</Text>
        </View>
        <View style={styles.divider}/>
        {item.targets.map((t,i)=>(
          <View key={i} style={styles.row}>
            <Text style={styles.label}>Target {i+1}</Text>
            <Text style={[styles.value,styles.targetValue]}>{t}</Text>
          </View>
        ))}
        <View style={styles.row}>
          <Text style={styles.label}>Stop Loss</Text>
          <Text style={[styles.value,styles.stopValue]}>{item.stopLoss}</Text>
        </View>
        <View style={styles.divider}/>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={()=>handleReaction(item.id,'like')}>
            <Ionicons name="thumbs-up" size={20} color={r.myType==='like'?'#34a853':'#666'} />
            <Text style={styles.actionCount}>{r.likeCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={()=>handleReaction(item.id,'dislike')}>
            <Ionicons name="thumbs-down" size={20} color={r.myType==='dislike'?'#ea4335':'#666'} />
            <Text style={styles.actionCount}>{r.dislikeCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={()=>onPressComments(item.id)}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#666" />
            <Text style={styles.actionCount}>{cCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        {/* logo ve arama yatayda */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo-blue.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.searchWrapper}>
            <TouchableOpacity onPress={onSearch}>
              <Ionicons name="search" size={20} color="#1a73e8" style={styles.searchIcon} />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="@traderKullanıcıAdi veya sinyal ara..."
              placeholderTextColor="#aaa"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={onSearch}
              underlineColorAndroid="transparent"
            />
          </View>
        </View>

        <FlatList
          data={filteredSignals}
          keyExtractor={i=>i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding:16, paddingBottom:40 }}
        />
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  loader:{ flex:1,justifyContent:'center',alignItems:'center' },
  container:{ 
    flex:1,
    paddingTop: Platform.OS==='android'
      ? (StatusBar.currentHeight||0)+16
      :16
  },

  // HEADER: logo ve arama yatay
  header:{
    flexDirection:'row',
    alignItems:'center',
    paddingHorizontal:8,
    marginBottom:12
  },
  logo:{
    width:95,
    height:95,
    marginRight:10
  },
  searchWrapper:{
    flex:1,
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#fff',
    borderRadius:24,
    paddingHorizontal:12,
    height:40,
    borderWidth:1,
    borderColor:'#1a73e8'
  },
  searchIcon:{ marginRight:8 },
  searchInput:{
    flex:1,
    fontSize:14,
    color:'#333',
    paddingVertical:0
  },

  card:{
    backgroundColor:'#fff',
    borderRadius:12,
    padding:20,
    marginVertical:8,
    marginHorizontal:8,
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
  userRow:{ flexDirection:'row',alignItems:'center',marginBottom:6 },
  username:{ marginLeft:6,fontSize:14,fontWeight:'600',color:'#1a73e8' },
  headerRow:{ flexDirection:'row',justifyContent:'space-between' },
  symbol:{ fontSize:18,fontWeight:'700' },
  timestampContainer:{ alignItems:'flex-end' },
  dateText:{ fontSize:12,color:'#999' },
  timeText:{ fontSize:12,color:'#666',marginTop:2 },
  metaRow:{ flexDirection:'row',marginTop:8 },
  directionBadge:{
    paddingHorizontal:12,paddingVertical:4,borderRadius:12,
    fontSize:12,fontWeight:'700',marginRight:8
  },
  longBadge:{ backgroundColor:'#e6f4ea',color:'#34a853' },
  shortBadge:{ backgroundColor:'#fdecea',color:'#ea4335' },
  timeBadge:{
    paddingHorizontal:10,paddingVertical:4,
    borderRadius:12,backgroundColor:'#eef4ff',color:'#1a73e8',
    fontSize:12,fontWeight:'700'
  },
  divider:{ height:1,backgroundColor:'#eee',marginVertical:12 },
  row:{ flexDirection:'row',justifyContent:'space-between',marginBottom:8 },
  label:{ fontSize:14,color:'#555' },
  value:{ fontSize:14,fontWeight:'600',color:'#333' },
  targetValue:{ color:'#34a853' },
  stopValue:{ color:'#ea4335' },
  actionsRow:{ flexDirection:'row',marginTop:12 },
  actionButton:{ flexDirection:'row',alignItems:'center',marginRight:24 },
  actionCount:{ marginLeft:4,fontSize:14,color:'#333' },
  empty:{ textAlign:'center',color:'#666',marginTop:20 }
});
