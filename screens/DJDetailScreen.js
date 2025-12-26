// screens/DJDetailScreen.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAppContext } from '../AppContext';

import { fetchAndSortDjSets, ensureDjRow } from '../services/djDetailService';
import { openSetInYouTube } from '../services/youtubeUiService';

function DJDetailScreen() {
  const { params } = useRoute();
  const { djName } = params ?? {};
  const { addSavedSet, savedSets, removeSavedSet } = useAppContext();

  const [djSets, setDjSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [djId, setDjId] = useState(null);

  const normalizedName = useMemo(() => (djName || '').trim(), [djName]);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        if (!normalizedName) return;
        setLoading(true);

        const sets = await fetchAndSortDjSets(normalizedName);
        if (!isMounted) return;

        setDjSets(sets);

        // ensure DJ row exists (use first thumbnail if available)
        const thumb = sets?.[0]?.thumbnail ?? null;
        const id = await ensureDjRow({ name: normalizedName, thumbnailUrl: thumb });
        if (!isMounted) return;

        setDjId(id);
      } catch (e) {
        console.log('DJDetail load error:', e?.message ?? e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, [normalizedName]);

  const renderItem = ({ item }) => {
    const isSaved = savedSets.some((s) => s.id === item.id);

    const handleToggleSave = () => {
      if (isSaved) removeSavedSet(item.id);
      else addSavedSet(item);
    };

    return (
      <View style={styles.setItem}>
        <TouchableOpacity onPress={() => openSetInYouTube(item?.videoId)}>
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
        {/* djId is still available here if you need it later */}
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={djSets}
          keyExtractor={(item) => item.id ?? item.videoId}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No past sets found.</Text>}
          contentContainerStyle={{ paddingBottom: 90 }}
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
});

export default DJDetailScreen;
