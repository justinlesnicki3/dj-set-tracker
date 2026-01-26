import { Alert } from 'react-native';
import { openYouTubeAt } from '../utils/openYouTubeAt';

// supports numbers (seconds) OR "mm:ss" / "hh:mm:ss"
function toSecondsMaybe(value) {
  if (value == null) return 0;
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  const s = String(value).trim();
  if (/^\d+$/.test(s)) return Number(s);

  const parts = s.split(':').map(Number);
  if (parts.some(Number.isNaN)) return 0;

  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
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

  const startSeconds = toSecondsMaybe(clip.start);

  try {
    await openYouTubeAt({ videoId: clip.videoId, start: startSeconds });
  } catch (e) {
    Alert.alert('Could not open YouTube', e?.message ?? String(e));
    throw e;
  }
}
