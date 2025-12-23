import { Alert } from 'react-native';

export function deleteClipFromPlaylist({ clip, playlistName, removeClipFromPlaylist, navigation }) {
  if (!clip) return;

  removeClipFromPlaylist?.(playlistName, clip.id);
  Alert.alert('Deleted', 'Clip has been removed from the playlist');
  navigation?.goBack?.();
}
