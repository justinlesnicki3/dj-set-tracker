import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useRoute, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';
import { LinearGradient } from 'expo-linear-gradient';

const PlaylistDetailScreen = () => {
  const { playlists } = useAppContext();
  const route = useRoute();
  const navigation = useNavigation();
  const { playlistName } = route.params;

  const [playlist, setPlaylist] = useState(null);
  const [shuffled, setShuffled] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const latest = playlists.find(p => p.name === playlistName);
      setPlaylist(latest);
    }, [playlists, playlistName])
  );

 const playClips = (clips) => {
  if (!clips?.length) {
    Alert.alert('No clips', 'This playlist has no clips yet.');
    return;
  }
  navigation.navigate('ClipPlayer', {
    clips,
    startIndex: 0,
    playlistName,
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

  const renderClip = ({ item }) => {
  // ✅ Add this log to verify thumbnail URL
  console.log('THUMBNAIL DEBUG:', item.thumbnail || item.thumnail || '❌ Missing');

 const thumbnailURL = item.thumbnail || item.thumnail || (item.videoId ? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg` : '');

  return (
    <TouchableOpacity
      style={styles.clipTouchable}
      onPress={() =>
        navigation.navigate('ClipPlayer', {
          clips: playlist.clips,
          startIndex: playlist.clips.findIndex(c => c.id === item.id),
          playlistName,
        })
      }
    >
      <LinearGradient
        colors={['#33498e', '#5a74e0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.clipCard}
      >
        <View style={styles.cardContent}>
          <Image
            source={{ uri: thumbnailURL || '' }}

            style={styles.thumbnail}
          />
          <View style={styles.textContent}>
            <Text style={styles.clipTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.clipTime}>
              {item.start} - {item.end}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};


  if (!playlist) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Playlist not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{playlistName}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handlePlayAll}>
          <Text style={styles.actionText}>Play All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShuffle}>
          <Text style={styles.actionText}>Shuffle</Text>
        </TouchableOpacity>
      </View>

      {playlist.clips.length === 0 ? (
        <Text style={styles.empty}>No clips in this playlist yet.</Text>
      ) : (
        <FlatList
          data={playlist.clips}
          keyExtractor={(item) => item.id}
          renderItem={renderClip}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#33498e',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  clipTouchable: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  clipCard: {
    padding: 12,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 120,               
    height: 120 * 9 / 16,      
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#000',
},
  textContent: {
    flex: 1,
  },
  clipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  clipTime: {
    fontSize: 14,
    color: '#ccc',
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
  },
actionButton: {
  backgroundColor: '#33498e',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 25,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 6,
  elevation: 3,
},
actionText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},

});

export default PlaylistDetailScreen;
