import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  ScrollView,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../api/supabase';
import { SignalsContext } from '../context/SignalsContext';
import Background from '../components/Background';

export default function ShareSignalScreen({ navigation }) {
  const { addSignal } = useContext(SignalsContext);

  const [user, setUser] = useState(null);
  const [symbol, setSymbol] = useState('ETHUSDT');
  const [direction, setDirection] = useState('LONG');
  const [timeFrame, setTimeFrame] = useState('1h');
  const [entryPrice, setEntryPrice] = useState('');
  const [leverage, setLeverage] = useState('');
  const [t1, setT1] = useState('');
  const [t2, setT2] = useState('');
  const [t3, setT3] = useState('');
  const [stopLoss, setStopLoss] = useState('');

  useEffect(() => {
    (async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      setUser(user);
    })();
  }, []);

  const handleSubmit = () => {
    if (!entryPrice || !leverage || !t1 || !t2 || !t3 || !stopLoss) {
      return Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
    }
    const now = new Date();
    addSignal({
      id: now.getTime().toString(),
      username: user.user_metadata.full_name || user.email,
      userId: user.id,
      timestamp: now.toISOString(),
      symbol,
      direction,
      timeFrame,
      entryPrice,
      recommendedLeverage: leverage,
      targets: [t1, t2, t3],
      stopLoss,
    });
    navigation.goBack();
  };

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.label}>Kripto Para</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={symbol}
              onValueChange={setSymbol}
              style={styles.picker}
            >
                <Picker.Item label="ETHUSDT" value="ETHUSDT" />
                <Picker.Item label="BTCUSDT" value="BTCUSDT" />
                <Picker.Item label="SOLUSDT" value="SOLUSDT" />
                <Picker.Item label="BNBUSDT" value="BNBUSDT" />
                <Picker.Item label="XRPUSDT" value="XRPUSDT" />
                <Picker.Item label="USDCUSDT" value="USDCUSDT" />
                <Picker.Item label="ADAUSDT" value="ADAUSDT" />
                <Picker.Item label="DOGEUSDT" value="DOGEUSDT" />
                <Picker.Item label="TRXUSDT" value="TRXUSDT" />
                <Picker.Item label="LINKUSDT" value="LINKUSDT" />
                <Picker.Item label="DOTUSDT" value="DOTUSDT" />
                <Picker.Item label="MATICUSDT" value="MATICUSDT" />
                <Picker.Item label="LTCUSDT" value="LTCUSDT" />
                <Picker.Item label="SHIBUSDT" value="SHIBUSDT" />
                <Picker.Item label="AVAXUSDT" value="AVAXUSDT" />
                <Picker.Item label="TONUSDT" value="TONUSDT" />
                <Picker.Item label="BCHUSDT" value="BCHUSDT" />
                <Picker.Item label="XLMUSDT" value="XLMUSDT" />
                <Picker.Item label="ICPUSDT" value="ICPUSDT" />
                <Picker.Item label="UNIUSDT" value="UNIUSDT" />
                <Picker.Item label="HBARUSDT" value="HBARUSDT" />
                <Picker.Item label="FILUSDT" value="FILUSDT" />
                <Picker.Item label="NEARUSDT" value="NEARUSDT" />
                <Picker.Item label="EOSUSDT" value="EOSUSDT" />
                <Picker.Item label="SANDUSDT" value="SANDUSDT" />
                <Picker.Item label="AXSUSDT" value="AXSUSDT" />
                <Picker.Item label="ALGOUSDT" value="ALGOUSDT" />
                <Picker.Item label="VETUSDT" value="VETUSDT" />
                <Picker.Item label="FTMUSDT" value="FTMUSDT" />
                <Picker.Item label="THETAUSDT" value="THETAUSDT" />
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
                  direction===dir && (dir==='LONG' ? styles.longBadge : styles.shortBadge)
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    direction===dir && (dir==='LONG' ? styles.longText : styles.shortText)
                  ]}
                >{dir}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Zaman Aralığı</Text>
          <View style={styles.row}>
            {['5m','10m','15m','30m','1h','2h','3h','4h','5h','6h','12h','1d'].map(tf => (
              <TouchableOpacity
                key={tf}
                onPress={() => setTimeFrame(tf)}
                style={[
                  styles.timeBadge,
                  timeFrame===tf && styles.timeBadgeSelected
                ]}
              >
                <Text
                  style={[
                    styles.timeText,
                    timeFrame===tf && styles.timeTextSelected
                  ]}
                >{tf.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Giriş Fiyatı</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn. 2192.00"
            keyboardType="numeric"
            value={entryPrice}
            onChangeText={setEntryPrice}
          />

          <Text style={styles.label}>Önerilen Kaldıraç</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn. 125"
            keyboardType="numeric"
            value={leverage}
            onChangeText={setLeverage}
          />

          <Text style={styles.label}>Hedef 1</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn. 2208.44"
            keyboardType="numeric"
            value={t1}
            onChangeText={setT1}
          />
          <Text style={styles.label}>Hedef 2</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn. 2215.01"
            keyboardType="numeric"
            value={t2}
            onChangeText={setT2}
          />
          <Text style={styles.label}>Hedef 3</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn. 2224.88"
            keyboardType="numeric"
            value={t3}
            onChangeText={setT3}
          />

          <Text style={styles.label}>Zarar Durdur</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn. 2188.71"
            keyboardType="numeric"
            value={stopLoss}
            onChangeText={setStopLoss}
          />

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
    paddingTop:
      Platform.OS==='android'
        ? (StatusBar.currentHeight||0)+16
        : 16,
    paddingHorizontal:16
  },
  label: {
    fontSize:15,
    fontWeight:'600',
    marginTop:16
  },
  pickerWrapper: {
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:8,
    overflow:'hidden'
  },
  picker: {
    height:50,
    width:'100%'
  },
  row: {
    flexDirection:'row',
    flexWrap:'wrap',
    marginTop:8
  },
  badge: {
    paddingHorizontal:12,
    paddingVertical:6,
    borderRadius:12,
    borderWidth:1,
    borderColor:'#ccc',
    marginRight:8,
    marginBottom:8
  },
  badgeText: { fontSize:14, color:'#333' },
  longBadge: { backgroundColor:'#e6f4ea', borderColor:'#34a853' },
  shortBadge: { backgroundColor:'#fdecea', borderColor:'#ea4335' },
  longText: { color:'#34a853', fontWeight:'700' },
  shortText: { color:'#ea4335', fontWeight:'700' },
  timeBadge: {
    paddingHorizontal:10,
    paddingVertical:4,
    borderRadius:10,
    borderWidth:1,
    borderColor:'#ccc',
    marginRight:6,
    marginBottom:6
  },
  timeBadgeSelected: { backgroundColor:'#eef4ff', borderColor:'#1a73e8' },
  timeText: { fontSize:12, color:'#333' },
  timeTextSelected: { color:'#1a73e8', fontWeight:'700' },
  input: {
    backgroundColor:'#fff',
    borderRadius:8,
    paddingHorizontal:12,
    paddingVertical:10,
    borderWidth:1,
    borderColor:'#ccc',
    marginTop:8
  },
  button: {
    backgroundColor:'#1a73e8',
    paddingVertical:14,
    borderRadius:8,
    alignItems:'center',
    marginVertical:24
  },
  buttonText: { color:'#fff', fontSize:16, fontWeight:'700' }
});
