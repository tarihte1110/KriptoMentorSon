import React, { useContext } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SignalsContext } from '../context/SignalsContext';
import Background from '../components/Background';

export default function HomeScreen() {
  const { signals } = useContext(SignalsContext);

  const renderPost = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text
          style={[
            styles.directionBadge,
            item.direction==='LONG' ? styles.longBadge : styles.shortBadge
          ]}
        >
          {item.direction}
        </Text>
        <Text style={styles.timeBadge}>{item.timeFrame.toUpperCase()}</Text>
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

      {item.targets.map((t,i)=>(
        <View style={styles.row} key={i}>
          <Text style={styles.label}>Target {i+1}</Text>
          <Text style={[styles.value, styles.targetValue]}>{t}</Text>
        </View>
      ))}

      <View style={styles.row}>
        <Text style={styles.label}>Stop Loss</Text>
        <Text style={[styles.value, styles.stopValue]}>{item.stopLoss}</Text>
      </View>

      <View style={styles.footer}>
        <Ionicons name="thumbs-up-outline" size={20} color="#666" />
        <Ionicons
          name="chatbubble-outline"
          size={20}
          color="#666"
          style={{ marginLeft:16 }}
        />
      </View>
    </View>
  );

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={signals}
          renderItem={renderPost}
          keyExtractor={obj=>obj.id}
          contentContainerStyle={signals.length===0 && styles.empty}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Henüz sinyal yok.</Text>
          }
        />
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'transparent',
    paddingTop:
      Platform.OS==='android'
        ? (StatusBar.currentHeight||0)+16
        : 16
  },
  empty:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },
  emptyText:{
    fontSize:16,
    color:'#666'
  },
  card:{
    backgroundColor:'#fff',
    alignSelf:'center',
    width:'90%',
    borderRadius:12,
    padding:20,
    marginVertical:10,
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
  header:{
    flexDirection:'row',
    justifyContent:'space-between'
  },
  username:{ fontSize:16, fontWeight:'700', color:'#1a73e8' },
  timestamp:{ fontSize:12, color:'#999' },
  metaRow:{
    flexDirection:'row',
    marginTop:8
  },
  directionBadge:{
    paddingHorizontal:12,
    paddingVertical:4,
    borderRadius:12,
    fontSize:12,
    fontWeight:'700'
  },
  longBadge:{ backgroundColor:'#e6f4ea', color:'#34a853', marginRight:8 },
  shortBadge:{ backgroundColor:'#fdecea', color:'#ea4335', marginRight:8 },
  timeBadge:{
    paddingHorizontal:10,
    paddingVertical:4,
    borderRadius:12,
    backgroundColor:'#eef4ff',
    color:'#1a73e8',
    fontSize:12,
    fontWeight:'700'
  },
  divider:{
    height:1,
    backgroundColor:'#eee',
    marginVertical:12
  },
  row:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginBottom:8
  },
  label:{ fontSize:14, color:'#555' },
  value:{ fontSize:14, fontWeight:'600', color:'#333' },
  targetValue:{ color:'#34a853' },
  stopValue:{ color:'#ea4335' },
  footer:{
    flexDirection:'row',
    marginTop:16
  }
});
