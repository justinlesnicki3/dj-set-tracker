import React, { useEffect, useState } from 'react';
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
import { openYouTubeVideo } from '../utils/openYouTubeAt'; // ✅ use helper (opens app w/ fallback)

const DJDetailScreen = () => {
  const { params } = useRoute();
  const { djName } = params ?? {}; // ✅ null-safe
  const navigation = useNavigation();

  const { djLibrary, addSavedSet, savedSets, removeSavedSet } = useAppContext();

  const [djSets, setDjSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        if (!djName) return;
        setLoading(true);
        const freshSets = await searchDJSets(djName);
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
  }, [djName]);

  const renderItem = ({ item }) => {
    const isSaved = savedSets.some((s) => s.id === item.id);

    const handleToggleSave = () => {
      if (isSaved) {
        removeSavedSet(item.id);
      } else {
        addSavedSet(item);
      }
    };

    const handleOpen = () => {
      if (!item?.videoId) {
        Alert.alert('Missing video', 'This item has no videoId.');
        return;
      }
      // Open full set at 0:00 (use openYouTubeAt if you want to jump to a time)
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
      <Text style={styles.header}>
        {djName ? `${djName}'s Past Sets` : 'Past Sets'}
      </Text>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={djSets}
          keyExtractor={(item) => item.id ?? item.videoId} // ✅ more robust
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.empty}>No past sets found.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
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
