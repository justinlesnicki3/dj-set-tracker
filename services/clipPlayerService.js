import { Alert } from 'react-native';
import { openYouTubeAt } from '../utils/openYouTubeAt';

function toSeconds(value) {
  if (value == null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  const s = String(value).trim();

  if (/^\d+$/.test(s)) return Number(s);

  const parts = s.split(':').map(Number);
  if (parts.some(Number.isNaN)) return null;

  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];

  return null;
}

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

export async function openClipInYouTube(clip) {
  if (!clip?.videoId) {
    Alert.alert('Missing video', 'This clip has no videoId.');
    return;
  }

  const startSeconds = toSeconds(clip.start);
  if (startSeconds == null) {
    Alert.alert('Bad timestamp', `Start time is invalid: ${String(clip.start)}`);
    return;
  }

  try {
    await openYouTubeAt({ videoId: clip.videoId, start: startSeconds });
  } catch (e) {
    Alert.alert('Could not open YouTube', e?.message ?? String(e));
  }
}
