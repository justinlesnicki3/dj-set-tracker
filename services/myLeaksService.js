// services/myLeaksService.js
import { Alert } from 'react-native';

export function confirmDeletePlaylist({ name, onConfirm }) {
  if (!name) return;

  Alert.alert(
    'Delete playlist',
    `Are you sure you want to delete "${name}"? This will remove all clips in it.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onConfirm?.(name),
      },
    ]
  );
}

export function buildPlaylistNavParams(playlistName) {
  return { playlistName };
}

export function playlistKey(item, index) {
  return item?.name ?? String(index);
}

export function clipCountLabel(count = 0) {
  return `${count} clip${count === 1 ? '' : 's'}`;
}
