import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppContext } from '../AppContext';

import {
  getCurrentClip,
  nextIndex,
  prevIndex,
  openClipInYouTube,
} from '../services/clipPlayerService';     //services for clip player logic

//import services for playlist management

import { deleteClipFromPlaylist } from '../services/playlistService';

    //navigation hooks

export default function ClipPlayerScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { clips = [], startIndex = 0, playlistName } = route.params ?? {};

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const currentClip = getCurrentClip(clips, currentIndex);

  const { removeClipFromPlaylist } = useAppContext();

        // handles edge case to prevent crashes when no clip is available

  if (!currentClip) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No clip selected</Text>
      </View>
    );
  }
            //Displays UI/shows current clip's information 
  return (
    <View style={styles.container}> 
      <Text style={styles.title}>{currentClip.title}</Text>     {/*Display clip metadata from currentClip*/}
      <Text style={styles.djSetTitle}>From: {currentClip.djSetTitle}</Text>
      <Text style={styles.timestamp}>       {/*display timestamp range for this specific clip*/}
        {currentClip.start} - {currentClip.end}
      </Text>

      {/*video preview*/}

      <View style={styles.playerWrapper}>   
                {/**Create the image URL using Youtubes thumbnail API, hqdefault helps provide high quality thumbnail*/}
        <Image      
          source={{ uri: `https://img.youtube.com/vi/${currentClip.videoId}/hqdefault.jpg` }}
          style={styles.thumbnail}
        />

              {/**Opens full video in YouTube app at the correct timestamp assigned */}

        <TouchableOpacity style={styles.playButton} onPress={() => openClipInYouTube(currentClip)}>
          <Text style={styles.playButtonText}>▶️ Play in YouTube</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>

        {/**Previous clip function */}

        <TouchableOpacity
          style={styles.button}
          onPress={() => setCurrentIndex((i) => prevIndex(i))}
        >
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>

        {/**Delete clip function */}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#d9534f' }]}
          onPress={() =>
            deleteClipFromPlaylist({
              clip: currentClip,
              playlistName,
              removeClipFromPlaylist,
              navigation,
            })
          }
        >
          <Text style={styles.buttonText}>Delete Clip</Text>
        </TouchableOpacity>

        {/**Next clip function */}

        <TouchableOpacity
          style={styles.button}
          onPress={() => setCurrentIndex((i) => nextIndex(i, clips.length))}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

            //Stylesheet

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 8 },
  djSetTitle: { textAlign: 'center', fontSize: 14, color: '#666' },
  timestamp: { textAlign: 'center', fontSize: 14, marginBottom: 16, color: '#444' },
  playerWrapper: { alignItems: 'center', marginBottom: 30 },
  thumbnail: { width: 240, height: 135, borderRadius: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { backgroundColor: '#33498e', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  playButton: { marginTop: 15, backgroundColor: '#e62117', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  playButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
