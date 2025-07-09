import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { useAppContext } from '../AppContext';

const ClipPlayerScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { clips, startIndex = 0, playlistName } = route.params;

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const currentClip = clips[currentIndex];

  const { removeClipFromPlaylist } = useAppContext();

  const handleDelete = () => {
    removeClipFromPlaylist(playlistName, currentClip.id);
    Alert.alert('Deleted', 'Clip has been removed from the playlist');
    navigation.goBack();
  };


  const goNext = () => {
    if (currentIndex < clips.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      Alert.alert('End of Playlist', 'No more clips to play.');
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      Alert.alert('Start of Playlist', 'You are at the first clip.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{currentClip.title}</Text>
      <Text style={styles.djSetTitle}>From: {currentClip.djSetTitle}</Text>
      <Text style={styles.timestamp}>From {currentClip.start} to {currentClip.end}</Text>

      <WebView
        style={styles.video}
        source={{
          uri: `https://www.youtube.com/embed/${currentClip.videoId}?start=${parseTime(currentClip.start)}&end=${parseTime(currentClip.end)}&autoplay=1`,
        }}
        allowsFullscreenVideo
      />

    <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={goBack}>
    <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.button, { backgroundColor: '#d9534f', marginTop: 20 }]}
            onPress={handleDelete}
        >
        <Text style={styles.buttonText}>Delete Clip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={goNext}>
    <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
    </View>
    </View>
  );
};

const parseTime = (timestamp) => {
  const [min, sec] = timestamp.split(':').map(Number);
  return min * 60 + sec;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#222',
  },
  timestamp: {
    alignSelf: 'center',
    backgroundColor: '#e0e0e0',
    color: '#444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 14,
    marginBottom: 12,
  },
  video: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 'auto',
  },
  button: {
    backgroundColor: '#33498e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  djSetTitle: {
  textAlign: 'center',
  fontSize: 14,
  color: '#666',
  marginBottom: 8,
},
});

export default ClipPlayerScreen;
