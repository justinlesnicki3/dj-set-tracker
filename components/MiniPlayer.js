import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../AppContext';
import { AntDesign } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const MiniPlayer = () => {
  const navigation = useNavigation();
  const { currentClip, isPlaying } = useContext(AppContext);
  const [expanded, setExpanded] = useState(false);

  if (!currentClip) return null;

  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };

  const handlePress = () => {
    navigation.navigate('ClipPlayer', { clips: [currentClip], startIndex: 0 });
  };

  return (
    <TouchableOpacity
      style={[styles.container, expanded && styles.expandedContainer]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: currentClip.thumbnail || currentClip.thumnail }}
        style={[styles.thumbnail, expanded && styles.largeThumbnail]}
      />
      <View style={styles.infoContainer}>
        <Text numberOfLines={1} style={[styles.title, expanded && styles.expandedTitle]}>
          {currentClip.title}
        </Text>
        <Text style={styles.timestamp}>{currentClip.start} - {currentClip.end}</Text>
      </View>
      <AntDesign name={isPlaying ? 'pausecircle' : 'playcircleo'} size={24} color="white" style={styles.icon} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#33498e',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 100,
  },
  expandedContainer: {
    height: 140,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: 64,
    height: 36,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: '#000',
  },
  largeThumbnail: {
    width: width - 40,
    height: (width - 40) * 0.5625,
    marginBottom: 10,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  expandedTitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  timestamp: {
    color: '#ccc',
    fontSize: 12,
  },
  icon: {
    marginLeft: 10,
  },
});

export default MiniPlayer;
