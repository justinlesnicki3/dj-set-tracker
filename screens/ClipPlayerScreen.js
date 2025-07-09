import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

const ClipPlayerScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { clips, startIndex = 0 } = route.params;

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const currentClip = clips[currentIndex];

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
      <Text style={styles.timestamp}>From {currentClip.start} to {currentClip.end}</Text>

      <WebView
        style={styles.video}
        source={{
          uri: `https://www.youtube.com/embed/${currentClip.videoId}?start=${parseTime(currentClip.start)}&end=${parseTime(currentClip.end)}&autoplay=1`,
        }}
        allowsFullscreenVideo
      />

      <View style={styles.buttonRow}>
        <Button title="Previous" onPress={goBack} />
        <Button title="Next" onPress={goNext} />
      </View>
    </View>
  );
};

const parseTime = (timestamp) => {
  const [min, sec] = timestamp.split(':').map(Number);
  return min * 60 + sec;
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  timestamp: { fontSize: 14, marginBottom: 10, color: '#666' },
  video: { height: 200, marginBottom: 20 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
});

export default ClipPlayerScreen;
