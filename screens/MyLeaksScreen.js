import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';

const MyLeaksScreen = () => {
  const { playlists } = useAppContext();
  const navigation = useNavigation();

  const renderPlaylist = ({ item }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => navigation.navigate('PlaylistDetail', { playlistName: item.name })}
    >
      <Text style={styles.playlistName}>{item.name}</Text>
      <Text style={styles.count}>{item.clips.length} clip(s)</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Playlists</Text>
      {playlists.length === 0 ? (
        <Text style={styles.empty}>No playlists yet. Create one by saving a clip.</Text>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.name}
          renderItem={renderPlaylist}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  playlistItem: {
    padding: 15,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    marginBottom: 10,
  },
  playlistName: { fontSize: 18, fontWeight: 'bold' },
  count: { fontSize: 14, color: '#666', marginTop: 5 },
  empty: { marginTop: 40, textAlign: 'center', color: '#999' },
});

export default MyLeaksScreen;
