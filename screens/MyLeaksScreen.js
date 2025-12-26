import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';

import {
  confirmDeletePlaylist,
  buildPlaylistNavParams,
  playlistKey,
  clipCountLabel,
} from '../services/myLeaksService';

function MyLeaksScreen() {
  const { playlists, removePlaylist } = useAppContext();
  const navigation = useNavigation();

  const renderPlaylist = ({ item }) => (
    <View style={styles.playlistRow}>
      <TouchableOpacity
        style={styles.playlistItem}
        onPress={() =>
          navigation.navigate(
            'PlaylistDetail',
            buildPlaylistNavParams(item.name)
          )
        }
      >
        <Text style={styles.playlistName}>{item.name}</Text>
        <Text style={styles.count}>{clipCountLabel(item.clips.length)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          confirmDeletePlaylist({
            name: item.name,
            onConfirm: removePlaylist,
          })
        }
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
          keyExtractor={playlistKey}
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
