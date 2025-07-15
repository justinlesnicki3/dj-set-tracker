import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';

const ClipPlayerScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { clips, startIndex = 0, playlistName } = route.params;
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  const playerRef = useRef();
  const currentClip = clips[currentIndex];
  const { removeClipFromPlaylist } = useAppContext();

  const parseTime = (timestamp) => {
    const [min, sec] = timestamp.split(':').map(Number);
    return min * 60 + sec;
  };

  const startSeconds = parseTime(currentClip.start);
  const endSeconds = parseTime(currentClip.end);

  const handleStateChange = (state) => {
    if (state === 'ended') goNext();
  };

  const goNext = () => {
    if (currentIndex < clips.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    } else {
      Alert.alert('End of Playlist', 'No more clips to play.');
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
    } else {
      Alert.alert('Start of Playlist', 'You are at the first clip.');
    }
  };

  const handleDelete = () => {
    removeClipFromPlaylist(playlistName, currentClip.id);
    Alert.alert('Deleted', 'Clip has been removed from the playlist');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{currentClip.title}</Text>
      <Text style={styles.djSetTitle}>From: {currentClip.djSetTitle}</Text>
      <Text style={styles.timestamp}>{currentClip.start} - {currentClip.end}</Text>

      <View style={styles.playerWrapper}>
        {loading && <ActivityIndicator size="large" color="#33498e" style={{ marginBottom: 10 }} />}

        <YoutubePlayer
          ref={playerRef}
          height={0} // Hide video
          width={0}
          play={isPlaying}
          videoId={currentClip.videoId}
          initialPlayerParams={{ start: startSeconds, end: endSeconds, controls: false, modestbranding: true }}
          onChangeState={handleStateChange}
          onReady={() => setLoading(false)}
        />

        <Image source={{ uri: `https://img.youtube.com/vi/${currentClip.videoId}/hqdefault.jpg` }} style={styles.thumbnail} />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={goBack}>
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#d9534f' }]} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete Clip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={goNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 8 },
  djSetTitle: { textAlign: 'center', fontSize: 14, color: '#666' },
  timestamp: { textAlign: 'center', fontSize: 14, marginBottom: 16, color: '#444' },
  playerWrapper: { alignItems: 'center', marginBottom: 30 },
  thumbnail: { width: 240, height: 135, borderRadius: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: {
    backgroundColor: '#33498e',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ClipPlayerScreen;
