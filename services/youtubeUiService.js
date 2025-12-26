// services/youtubeUiService.js
import { Alert } from 'react-native';
import { openYouTubeVideo } from '../utils/openYouTubeAt';

export function openSetInYouTube(videoId) {
  if (!videoId) {
    Alert.alert('Missing video', 'This item has no videoId.');
    return;
  }
  openYouTubeVideo(videoId);
}
