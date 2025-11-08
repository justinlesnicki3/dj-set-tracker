// DJDetailScreen.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';
import { searchDJSets } from '../services/youtube';
import { openYouTubeVideo } from '../utils/openYouTubeAt'; // opens app with fallback
import { supabase } from '../lib/supabase';

/** ---------- Subscribe Button (Supabase) ---------- */
function SubscribeButton({ djId }) {
  const [isSubbed, setIsSubbed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user || !djId) return;
        const { data, error } = await supabase
          .from('subscriptions')
          .select('dj_id')
          .eq('user_id', auth.user.id)
          .eq('dj_id', djId)
          .maybeSingle();
        if (error) throw error;
        setIsSubbed(!!data);
      } catch {
        // ignore initial fail
      }
    })();
  }, [djId]);

  const toggle = async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        Alert.alert('Sign in required', 'Please sign in to subscribe.');
        return;
      }
      if (isSubbed) {
        const { error } = await supabase
          .from('subscriptions')
          .delete()
          .eq('user_id', auth.user.id)
          .eq('dj_id', djId);
        if (error) throw error;
        setIsSubbed(false);
      } else {
        const { error } = await supabase
          .from('subscriptions')
          .insert({ user_id: auth.user.id, dj_id: djId });
        if (error) throw error;
        setIsSubbed(true);
      }
    } catch (e) {
      Alert.alert('Subscription error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={toggle}
      disabled={loading || !djId}
      style={[
        styles.subBtn,
        { backgroundColor: isSubbed ? '#999' : '#33498e', opacity: djId ? 1 : 0.5 },
      ]}
    >
      <Text style={styles.subBtnText}>{isSubbed ? 'Subscribed' : 'Subscribe'}</Text>
    </TouchableOpacity>
  );
}

/** ---------- Main Screen ---------- */
function DJDetailScreen() {
  const { params } = useRoute();
  const { djName } = params ?? {};
  const navigation = useNavigation();
  const { addSavedSet, savedSets, removeSavedSet } = useAppContext();

  const [djSets, setDjSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [djId, setDjId] = useState(null);

  const normalizedName = useMemo(() => (djName || '').trim(), [djName]);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        if (!normalizedName) return;
        setLoading(true);
        const freshSets = await searchDJSets(normalizedName);
        const sortedSets = freshSets.sort(
          (a, b) => new Date(b.publishDate) - new Date(a.publishDate)
        );
        setDjSets(sortedSets);
      } catch (error) {
        console.error('Failed to fetch DJ sets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSets();
  }, [normalizedName]);

  useEffect(() => {
    const ensureDjRow = async () => {
      if (!normalizedName) return;
      try {
        let { data: existing, error: selErr } = await supabase
          .from('djs')
          .select('id')
          .eq('name', normalizedName)
          .maybeSingle();
        if (selErr) throw selErr;

        if (existing?.id) {
          setDjId(existing.id);
          return;
        }

        const thumb = djSets?.[0]?.thumbnail ?? null;
        const { data: inserted, error: insErr } = await supabase
          .from('djs')
          .insert({
            name: normalizedName,
            image_url: thumb,
          })
          .select('id')
          .single();
        if (insErr) throw insErr;
        setDjId(inserted.id);
      } catch (e) {
        console.log('ensureDjRow error:', e.message);
      }
    };

    if (normalizedName) ensureDjRow();
  }, [normalizedName, djSets?.length]);

  const renderItem = ({ item }) => {
    const isSaved = savedSets.some((s) => s.id === item.id);

    const handleToggleSave = () => {
      if (isSaved) removeSavedSet(item.id);
      else addSavedSet(item);
    };

    const handleOpen = () => {
      if (!item?.videoId) {
        Alert.alert('Missing video', 'This item has no videoId.');
        return;
      }
      openYouTubeVideo(item.videoId);
    };

    return (
      <View style={styles.setItem}>
        <TouchableOpacity onPress={handleOpen}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>
            Posted: {new Date(item.publishDate).toLocaleDateString()}
          </Text>

          <TouchableOpacity
            style={[styles.saveButton, isSaved && styles.saveButtonSaved]}
            onPress={handleToggleSave}
          >
            <Text style={styles.saveButtonText}>
              {isSaved ? '✓ Saved (Unsave)' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>
          {normalizedName ? `${normalizedName}'s Past Sets` : 'Past Sets'}
        </Text>
        <SubscribeButton djId={djId} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={djSets}
          keyExtractor={(item) => item.id ?? item.videoId}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No past sets found.</Text>}
          contentContainerStyle={{ paddingBottom: 90 }} // ✅ safeguard if list is short
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  header: { fontSize: 24, fontWeight: 'bold', marginRight: 12, flex: 1 },
  setItem: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
  thumbnail: { width: 100, height: 60, marginRight: 10, borderRadius: 5 },
  title: { fontSize: 16, fontWeight: '500' },
  date: { fontSize: 14, color: '#666', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 50, color: '#888' },
  saveButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  saveButtonSaved: { backgroundColor: '#4CAF50' },
  saveButtonText: { color: '#fff', fontSize: 14 },
  subBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  subBtnText: { color: '#fff', fontWeight: '700' },
});

export default DJDetailScreen;