import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';

function MyLeaksScreen() {
  const { playlists, removePlaylist } = useAppContext(); // 👈 make sure this exists in AppContext
  const navigation = useNavigation();

  const handleDelete = (name) => {
    Alert.alert(
      'Delete playlist',
      `Are you sure you want to delete "${name}"? This will remove all clips in it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removePlaylist(name),
        },
      ]
    );
  };

  const renderPlaylist = ({ item }) => (
    <View style={styles.playlistRow}>
      <TouchableOpacity
        style={styles.playlistItem}
        onPress={() =>
          navigation.navigate('PlaylistDetail', { playlistName: item.name })
        }
      >
        <Text style={styles.playlistName}>{item.name}</Text>
        <Text style={styles.count}>{item.clips.length} clip(s)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.name)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>My Playlists</Text>
      {playlists.length === 0 ? (
        <Text style={styles.empty}>
          No playlists yet. Create one by saving a clip.
        </Text>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.name}
          renderItem={renderPlaylist}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  playlistItem: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    marginRight: 8,
  },
  playlistName: { fontSize: 18, fontWeight: 'bold' },
  count: { fontSize: 14, color: '#666', marginTop: 5 },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
  },
  deleteText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  empty: { marginTop: 40, textAlign: 'center', color: '#999' },
});

export default MyLeaksScreen;
