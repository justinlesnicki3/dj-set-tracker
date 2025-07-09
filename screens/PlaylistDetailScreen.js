import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAppContext } from '../AppContext';
import { useNavigation } from '@react-navigation/native';

const PlaylistDetailScreen = () => {
  const { playlists } = useAppContext();
  const route = useRoute();
  const navigation = useNavigation();
  const { playlistName } = route.params;

  const playlist = playlists.find(p => p.name === playlistName);
  const [shuffled, setShuffled] = useState(false);

  const playClips = (clips) => {
    if (clips.length === 0) {
      Alert.alert('No clips', 'This playlist has no clips yet.');
      return;
    }

    // Example: Navigate to first clip in list
    navigation.navigate('ClipPlayer', {
      clips: clips,
      startIndex: 0,
    });
  };

  const handlePlayAll = () => {
    setShuffled(false);
    playClips(playlist.clips);
  };

  const handleShuffle = () => {
    setShuffled(true);
    const shuffledClips = [...playlist.clips].sort(() => Math.random() - 0.5);
    playClips(shuffledClips);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{playlistName}</Text>

      <View style={styles.buttonRow}>
        <Button title="Play All" onPress={handlePlayAll} />
        <Button title="Shuffle" onPress={handleShuffle} />
      </View>

      <FlatList
        data={playlist.clips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.clipItem}
            onPress={() =>
              navigation.navigate('ClipPlayer', {
                clips: playlist.clips,
                startIndex: playlist.clips.findIndex(c => c.id === item.id),
              })
            }
          >
            <Text style={styles.clipTitle}>{item.title}</Text>
            <Text style={styles.clipTime}>
              {item.start} - {item.end}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  clipItem: {
    padding: 15,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 10,
  },
  clipTitle: { fontSize: 16, fontWeight: '500' },
  clipTime: { fontSize: 14, color: '#666' },
});

export default PlaylistDetailScreen;
