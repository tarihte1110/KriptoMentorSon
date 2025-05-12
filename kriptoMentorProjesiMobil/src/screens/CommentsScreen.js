// src/screens/CommentsScreen.js

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Background from '../components/Background';
import { supabase } from '../api/supabase';

const INDENT = 16;

export default function CommentsScreen({ route, navigation }) {
  const { signalId } = route.params;
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [commentsData, setCommentsData] = useState({ roots: [], repliesMap: {} });
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  // Düzenleme state’leri
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data:{ session }, error: sessErr } = await supabase.auth.getSession();
        if (sessErr) throw sessErr;
        if (!session?.user) return navigation.replace('Login');
        setUser(session.user);
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (profErr) throw profErr;
        setProfile(prof);
      } catch (err) {
        console.error(err);
        Alert.alert('Oturum Hatası', err.message);
      }
    })();
  }, []);

  useEffect(() => {
    if (signalId) fetchComments();
  }, [signalId]);

  async function fetchComments() {
    setLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from('comments')
        .select('id, user_id, content, created_at, parent_id')
        .eq('signal_id', signalId)
        .order('created_at', { ascending: true });
      if (error) throw error;

      const userIds = [...new Set(rows.map(r => r.user_id))];
      const { data: profs = [] } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const profMap = {};
      profs.forEach(p => profMap[p.user_id] = p.full_name || 'Anonim');

      const merged = rows.map(r => ({
        ...r,
        author: profMap[r.user_id] || 'Anonim'
      }));
      const idToAuthor = {};
      merged.forEach(m => idToAuthor[m.id] = m.author);

      const enriched = merged.map(m => ({
        ...m,
        replyToAuthor: m.parent_id ? idToAuthor[m.parent_id] : null
      }));

      const roots = enriched.filter(r => r.parent_id === null);
      const repliesMap = enriched.reduce((map, r) => {
        if (r.parent_id) {
          map[r.parent_id] = map[r.parent_id] || [];
          map[r.parent_id].push(r);
        }
        return map;
      }, {});

      setCommentsData({ roots, repliesMap });
    } catch (err) {
      console.error(err);
      Alert.alert('Yorumlar yüklenemedi', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePost() {
    if (!newComment.trim()) return;
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          signal_id: signalId,
          user_id:    user.id,
          content:    newComment.trim(),
          parent_id:  null
        });
      if (error) throw error;
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error(err);
      Alert.alert('Yorum gönderilemedi', err.message);
    }
  }

  async function handleReply() {
    if (!replyText.trim() || !replyingTo) return;
    try {
      const replyTo = commentsData.repliesMap[replyingTo]?.[0]?.replyToAuthor || '';
      const content = replyTo ? `@${replyTo} ${replyText.trim()}` : replyText.trim();
      const { error } = await supabase
        .from('comments')
        .insert({
          signal_id:  signalId,
          user_id:    user.id,
          content,
          parent_id:  replyingTo
        });
      if (error) throw error;
      setReplyText('');
      setReplyingTo(null);
      fetchComments();
    } catch (err) {
      console.error(err);
      Alert.alert('Cevap gönderilemedi', err.message);
    }
  }

  // Düzenlemeyi kaydet
  async function handleSaveEdit(id) {
    if (!editingText.trim()) {
      setEditingId(null);
      return;
    }
    try {
      const { error: updErr } = await supabase
        .from('comments')
        .update({ content: editingText.trim() })
        .eq('id', id);
      if (updErr) {
        Alert.alert('Düzenleme Başarısız', updErr.message);
      } else {
        setEditingId(null);
        setEditingText('');
        fetchComments();
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Düzenleme Hatası', err.message);
    }
  }

  // Silme onayı
  function confirmDelete(id) {
    Alert.alert(
      'Yorumu Sil',
      'Bu yorumu silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error: delErr } = await supabase
                .from('comments')
                .delete()
                .eq('id', id);
              if (delErr) {
                Alert.alert('Silme Başarısız', delErr.message);
              } else {
                fetchComments();
              }
            } catch (err) {
              console.error(err);
              Alert.alert('Silme Hatası', err.message);
            }
          }
        }
      ]
    );
  }

  const renderComment = (comment) => {
    const isReply = comment.parent_id !== null;
    return (
      <View key={comment.id} style={{ marginBottom: 16 }}>
        {editingId === comment.id ? (
          <View style={[styles.commentBox, isReply && { marginLeft: INDENT }]}>
            <TextInput
              style={[styles.input, { backgroundColor: '#fff', marginBottom: 8 }]}
              value={editingText}
              onChangeText={setEditingText}
              multiline
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setEditingId(null)} style={{ marginRight: 16 }}>
                <Ionicons name="close-circle-outline" size={24} color="#ea4335" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSaveEdit(comment.id)}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#34a853" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.commentBox, isReply && { marginLeft: INDENT }]}>
            <Text style={styles.commentAuthor}>{comment.author}</Text>
            <Text style={styles.commentText}>
              {comment.replyToAuthor
                ? `@${comment.replyToAuthor} ${comment.content}`
                : comment.content}
            </Text>
            <Text style={styles.commentTime}>
              {new Date(comment.created_at).toLocaleDateString()}{' '}
              {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <View style={styles.actionsRow}>
              {profile?.user_type === 'investor' && (
                <TouchableOpacity
                  onPress={() => {
                    setReplyingTo(comment.id);
                    setReplyText('');
                  }}
                >
                  <Text style={styles.replyButtonText}>Cevapla</Text>
                </TouchableOpacity>
              )}
              {comment.user_id === user.id && (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingId(comment.id);
                      setEditingText(comment.content);
                    }}
                    style={{ marginLeft: 16 }}
                  >
                    <Ionicons name="pencil-outline" size={20} color="#1a73e8" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => confirmDelete(comment.id)}
                    style={{ marginLeft: 12 }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ea4335" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}

        {replyingTo === comment.id && editingId !== comment.id && (
          <View style={[styles.replyInputRow, isReply && { marginLeft: INDENT }]}>
            <TextInput
              style={styles.input}
              placeholder="Cevap yaz..."
              value={replyText}
              onChangeText={setReplyText}
              multiline
            />
            <TouchableOpacity style={styles.postBtn} onPress={handleReply}>
              <Ionicons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {(commentsData.repliesMap[comment.id] || []).map(child =>
          renderComment(child)
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <Background>
        <SafeAreaView style={styles.loader}>
          <ActivityIndicator size="large" color="#1a73e8"/>
        </SafeAreaView>
      </Background>
    );
  }

  return (
    <Background>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={commentsData.roots}
          keyExtractor={c => c.id}
          renderItem={({ item }) => renderComment(item)}
          ListEmptyComponent={<Text style={styles.empty}>Henüz yorum yok</Text>}
          contentContainerStyle={{ padding:16, paddingBottom:120 }}
        />
        {profile?.user_type === 'investor' && !editingId && (
          <View style={styles.bottomInputRow}>
            <TextInput
              style={styles.input}
              placeholder="Yorum yaz..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity style={styles.postBtn} onPress={handlePost}>
              <Ionicons name="send" size={24} color="#fff"/>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  loader:{ flex:1,justifyContent:'center',alignItems:'center' },
  container:{ flex:1, paddingTop: Platform.OS==='android'
      ? (StatusBar.currentHeight||0)+16
      :16 },
  commentBox:{
    backgroundColor:'#fff',
    borderRadius:8,
    padding:12,
    ...Platform.select({
      ios:{ shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.1, shadowRadius:2 },
      android:{ elevation:1 }
    })
  },
  commentAuthor:{ fontWeight:'700', marginBottom:4, color:'#1a73e8' },
  commentText:{ fontSize:14, color:'#333' },
  commentTime:{ fontSize:10, color:'#999', marginTop:6, textAlign:'right' },
  actionsRow:{ flexDirection:'row', marginTop:8, alignItems:'center' },
  replyButtonText:{ color:'#1a73e8', fontSize:12 },
  replyInputRow:{ flexDirection:'row', alignItems:'center', marginTop:8 },
  bottomInputRow:{
    position:'absolute', bottom:0, left:0, right:0,
    flexDirection:'row', padding:8,
    backgroundColor:'#fff', borderTopColor:'#eee', borderTopWidth:1
  },
  input:{
    flex:1, minHeight:40,
    backgroundColor:'#f5f5f5', borderRadius:20,
    paddingHorizontal:12, textAlignVertical:'top'
  },
  postBtn:{
    width:40, height:40,
    backgroundColor:'#1a73e8', borderRadius:20,
    justifyContent:'center', alignItems:'center',
    marginLeft:8
  },
  empty:{ textAlign:'center', color:'#666', marginTop:20 }
});
