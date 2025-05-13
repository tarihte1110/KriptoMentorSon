import React, { useEffect, useState } from 'react';
import { useParams, useNavigate }     from 'react-router-dom';
import { supabase }                   from '../lib/supabaseClient';
import {
  FaArrowLeft,
  FaPaperPlane,
  FaReply,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import './CommentsPage.css';

export default function CommentsPage() {
  const { signalId } = useParams();
  const navigate     = useNavigate();

  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [comments, setComments] = useState({ roots: [], repliesMap: {} });
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText]   = useState('');
  const [editingId, setEditingId]   = useState(null);
  const [editingText, setEditingText] = useState('');
  const [loading, setLoading]       = useState(true);

  // silme modalı için
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // --- 1) Oturum ve profil çek ---
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data:{ session } }) => {
        if (!session?.user) return navigate('/auth');
        setUser(session.user);
        return supabase
          .from('profiles')
          .select('user_id, user_type, full_name')
          .eq('user_id', session.user.id)
          .maybeSingle();
      })
      .then(({ data }) => setProfile(data))
      .catch(console.error);
  }, [navigate]);

  // --- fetchComments fonksiyonu ---
  const fetchComments = async () => {
    if (!signalId) return;
    setLoading(true);
    try {
      const { data: raw, error } = await supabase
        .from('comments')
        .select('id, user_id, content, created_at, parent_id')
        .eq('signal_id', signalId)
        .order('created_at', { ascending: true });
      if (error) throw error;

      const userIds = [...new Set(raw.map(c => c.user_id))];
      const { data: profs } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const nameMap = {};
      profs.forEach(p => (nameMap[p.user_id] = p.full_name || 'Anonim'));

      const enriched = raw.map(c => ({
        ...c,
        author: nameMap[c.user_id]
      }));

      const roots = enriched.filter(c => !c.parent_id);
      const repliesMap = {};
      enriched.forEach(c => {
        if (c.parent_id) {
          repliesMap[c.parent_id] = repliesMap[c.parent_id] || [];
          repliesMap[c.parent_id].push(c);
        }
      });

      setComments({ roots, repliesMap });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2) İlk yüklemede çek ---
  useEffect(() => {
    fetchComments();
  }, [signalId]);

  // --- 3) Yeni yorum ---
  const postComment = async () => {
    if (!newComment.trim()) return;
    await supabase.from('comments').insert({
      signal_id: signalId,
      user_id:    user.id,
      content:    newComment.trim(),
      parent_id:  null
    });
    setNewComment('');
    fetchComments();
  };

  // --- 4) Yeni cevap ---
  const postReply = async () => {
    if (!replyText.trim() || !replyingTo) return;
    await supabase.from('comments').insert({
      signal_id: signalId,
      user_id:    user.id,
      content:    replyText.trim(),
      parent_id:  replyingTo
    });
    setReplyText('');
    setReplyingTo(null);
    fetchComments();
  };

  // --- 5) Düzenleme ---
  const startEdit = c => {
    setEditingId(c.id);
    setEditingText(c.content);
  };
  const saveEdit = async () => {
    if (!editingText.trim()) return setEditingId(null);
    await supabase
      .from('comments')
      .update({ content: editingText.trim() })
      .eq('id', editingId);
    setEditingId(null);
    setEditingText('');
    fetchComments();
  };

  // --- 6) Silme (modal üzerinden) ---
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    await supabase
      .from('comments')
      .delete()
      .eq('id', deleteTargetId);
    setDeleteTargetId(null);
    fetchComments();
  };

  if (loading) {
    return <div className="comments-page loader">Yükleniyor…</div>;
  }

  return (
    <div className="comments-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Geri
      </button>
      <h2>Yorumlar</h2>

      <div className="comments-list">
        {comments.roots.length === 0 && (
          <p className="empty">Henüz yorum yok.</p>
        )}
        {comments.roots.map(c => (
          <React.Fragment key={c.id}>
            <CommentItem
              comment={c}
              isReply={false}
              onReply={() => setReplyingTo(c.id)}
              onEdit={() => startEdit(c)}
              onDelete={() => setDeleteTargetId(c.id)}
              editingId={editingId}
              editingText={editingText}
              setEditingText={setEditingText}
              saveEdit={saveEdit}
              profile={profile}
            />

            {/* cevap kutusu */}
            {replyingTo === c.id && profile?.user_type === 'investor' && (
              <div className="new-reply">
                <textarea
                  placeholder="Cevap yaz..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />
                <button onClick={postReply}>
                  <FaPaperPlane />
                </button>
              </div>
            )}

            {/* cevaplar */}
            {(comments.repliesMap[c.id] || []).map(r => (
              <CommentItem
                key={r.id}
                comment={r}
                isReply={true}
                onReply={() => setReplyingTo(r.id)}
                onEdit={() => startEdit(r)}
                onDelete={() => setDeleteTargetId(r.id)}
                editingId={editingId}
                editingText={editingText}
                setEditingText={setEditingText}
                saveEdit={saveEdit}
                profile={profile}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* yeni kök yorum */}
      {profile?.user_type === 'investor' && (
        <div className="new-comment">
          <textarea
            placeholder="Yorum yaz..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
          <button onClick={postComment}>
            <FaPaperPlane />
          </button>
        </div>
      )}

      {/* silme onay modalı */}
      {deleteTargetId && (
        <div className="modal-overlay" onClick={() => setDeleteTargetId(null)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
          >
            <h3>Yorumu Sil</h3>
            <p>Bu yorumu silmek istediğinize emin misiniz?</p>
            <div className="modal-buttons">
              <button
                className="modal-btn cancel"
                onClick={() => setDeleteTargetId(null)}
              >
                İptal
              </button>
              <button
                className="modal-btn confirm"
                onClick={confirmDelete}
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Ayrık bir yorum kutusu bileşeni
function CommentItem({
  comment,
  isReply,
  onReply,
  onEdit,
  onDelete,
  editingId,
  editingText,
  setEditingText,
  saveEdit,
  profile
}) {
  const time =
    new Date(comment.created_at).toLocaleDateString() +
    ' ' +
    new Date(comment.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <div className={`comment-box${isReply ? ' reply' : ''}`}>
      {editingId === comment.id ? (
        <>
          <textarea
            className="edit-textarea"
            value={editingText}
            onChange={e => setEditingText(e.target.value)}
          />
          <div className="edit-actions">
            <button onClick={() => setEditingText('')}>
              <FaTimes />
            </button>
            <button onClick={saveEdit}>
              <FaCheck />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="comment-header">
            <span className="author">{comment.author}</span>
            <span className="time">{time}</span>
          </div>
          <div className="comment-body">{comment.content}</div>
          <div className="comment-actions">
            {profile?.user_type === 'investor' && (
              <button className="act" onClick={onReply}>
                <FaReply /> Cevapla
              </button>
            )}
            {comment.user_id === profile?.user_id && (
              <>
                <button className="act" onClick={onEdit}>
                  <FaEdit />
                </button>
                <button className="act delete" onClick={onDelete}>
                  <FaTrash />
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
