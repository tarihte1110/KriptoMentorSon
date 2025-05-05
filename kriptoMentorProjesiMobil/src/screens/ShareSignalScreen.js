import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../api/supabase';
import { SignalsContext } from '../context/SignalsContext';
import Background from '../components/Background';

export default function ShareSignalScreen({ navigation }) {
  const { addSignal } = useContext(SignalsContext);

  const [user, setUser] = useState(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const [symbol, setSymbol] = useState('ETHUSDT');
  const [direction, setDirection] = useState('LONG');
  const [timeFrame, setTimeFrame] = useState('1h');
  const [entryPrice, setEntryPrice] = useState('');
  const [leverage, setLeverage] = useState('');
  const [t1, setT1] = useState('');
  const [t2, setT2] = useState('');
  const [t3, setT3] = useState('');
  const [stopLoss, setStopLoss] = useState('');

  const handleSubmit = () => {
    if (!entryPrice || !leverage || !t1 || !t2 || !t3 || !stopLoss) {
      return Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
    }
    const now = new Date().toISOString();
    addSignal({
      userId: user.id,
      username: user.user_metadata.full_name || user.email,
      symbol,
      direction,
      timeFrame,
      entryPrice,
      recommendedLeverage: leverage,
      targets: [t1, t2, t3],
      stopLoss,
      timestamp: now
    });
    navigation.goBack();
  };

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.label}>Kripto Para</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={symbol}
              onValueChange={setSymbol}
              style={styles.picker}
            >
              <Picker.Item label="ETHUSDT" value="ETHUSDT" />
              <Picker.Item label="BTCUSDT" value="BTCUSDT" />
              <Picker.Item label="SOLUSDT" value="SOLUSDT" />
              <Picker.Item label="BNBUSDT" value="BNBUSDT" />
            </Picker>
          </View>

          <Text style={styles.label}>Pozisyon</Text>
          <View style={styles.row}>
            {['LONG','SHORT'].map(dir => (
              <TouchableOpacity
                key={dir}
                onPress={() => setDirection(dir)}
                style={[
                  styles.badge,
                  direction===dir && (dir==='LONG'?styles.longBadge:styles.shortBadge)
                ]}
              >
                <Text style={[
                  styles.badgeText,
                  direction===dir&&(dir==='LONG'?styles.longText:styles.shortText)
                ]}>{dir}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Zaman Aralığı</Text>
          <View style={styles.row}>
            {['5m','15m','30m','1h','2h','4h','6h'].map(tf=>(
              <TouchableOpacity
                key={tf}
                onPress={()=>setTimeFrame(tf)}
                style={[
                  styles.timeBadge,
                  timeFrame===tf&&styles.timeBadgeSel
                ]}
              >
                <Text style={[
                  styles.timeText,
                  timeFrame===tf&&styles.timeTextSel
                ]}>{tf.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {[
            ['Entry Price', entryPrice, setEntryPrice],
            ['Leverage', leverage, setLeverage],
            ['Target 1', t1, setT1],
            ['Target 2', t2, setT2],
            ['Target 3', t3, setT3],
            ['Stop Loss', stopLoss, setStopLoss]
          ].map(([label, val, fn])=>(
            <React.Fragment key={label}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder={`Örn. ${label}`}
                value={val}
                onChangeText={fn}
              />
            </React.Fragment>
          ))}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Sinyal Paylaş</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor:'transparent',
    paddingTop: Platform.OS==='android'
      ? (StatusBar.currentHeight||0)+16
      : 16,
    paddingHorizontal:16
  },
  label: {
    fontSize:16,
    fontWeight:'600',
    marginTop:16
  },
  pickerBox:{
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:8,
    overflow:'hidden'
  },
  picker:{
    height:50,
    width:'100%'
  },
  row:{
    flexDirection:'row',
    flexWrap:'wrap',
    marginTop:8
  },
  badge:{
    padding:8,
    borderRadius:12,
    borderWidth:1,
    borderColor:'#ccc',
    marginRight:8,
    marginBottom:8
  },
  badgeText:{ fontSize:14 },
  longBadge:{ backgroundColor:'#e6f4ea', borderColor:'#34a853' },
  shortBadge:{ backgroundColor:'#fdecea', borderColor:'#ea4335' },
  longText:{ color:'#34a853', fontWeight:'700' },
  shortText:{ color:'#ea4335', fontWeight:'700' },
  timeBadge:{
    paddingHorizontal:10,
    paddingVertical:4,
    borderRadius:10,
    borderWidth:1,
    borderColor:'#ccc',
    marginRight:6,
    marginBottom:6
  },
  timeBadgeSel:{ backgroundColor:'#eef4ff', borderColor:'#1a73e8' },
  timeText:{ fontSize:12 },
  timeTextSel:{ color:'#1a73e8', fontWeight:'700' },
  input:{
    backgroundColor:'#fff',
    borderRadius:8,
    padding:12,
    borderWidth:1,
    borderColor:'#ccc',
    marginTop:8
  },
  button:{
    backgroundColor:'#1a73e8',
    padding:16,
    borderRadius:8,
    alignItems:'center',
    marginVertical:24
  },
  buttonText:{ color:'#fff', fontWeight:'700', fontSize:16 }
});
