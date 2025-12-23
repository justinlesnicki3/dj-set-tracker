import { Alert } from 'react-native';
import { openYouTubeAt } from '../utils/openYouTubeAt';

export function getCurrentClip(clips = [], currentIndex = 0) {
  return clips?.[currentIndex] ?? null;
}

export function nextIndex(currentIndex, clipsLength) {
  if (currentIndex < clipsLength - 1) return currentIndex + 1;
  Alert.alert('End of Playlist', 'No more clips to play.');
  return currentIndex;
}

export function prevIndex(currentIndex) {
  if (currentIndex > 0) return currentIndex - 1;
  Alert.alert('Start of Playlist', 'You are at the first clip.');
  return currentIndex;
}

export function openClipInYouTube(clip) {
  if (!clip?.videoId) {
    Alert.alert('Missing video', 'This clip has no videoId.');
    return;
  }
  openYouTubeAt({ videoId: clip.videoId, start: clip.start });
}
