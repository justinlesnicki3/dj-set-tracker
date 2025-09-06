// utils/openYouTubeAt.js
import { Platform, Linking, Alert } from 'react-native';

const parseTimeToSeconds = (ts) => {
  if (!ts) return 0;
  const parts = ts.split(':').map(Number); // supports "hh:mm:ss" or "mm:ss"
  if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
  if (parts.length === 2) return parts[0]*60 + parts[1];
  return Number(ts) || 0; // allow raw seconds like "95"
};

export async function openYouTubeAt({ videoId, start = '0:00' }) {
  const seconds = parseTimeToSeconds(start);

  // App-first URLs
  const iosAppUrl     = `youtube://watch?v=${videoId}&start=${seconds}`;
  const androidAppUrl = `vnd.youtube://${videoId}?t=${seconds}`;
  const androidAltUrl = `youtube://www.youtube.com/watch?v=${videoId}&t=${seconds}`;

  // Web fallback (often still hands off to the app if installed)
  const webUrl = `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;

  try {
    if (Platform.OS === 'ios') {
      // Try the iOS scheme directly; if it fails, fall back to web
      await Linking.openURL(iosAppUrl);
    } else {
      // Android OEMs vary: try vnd.youtube://, then youtube://, then web
      try {
        await Linking.openURL(androidAppUrl);
      } catch {
        try {
          await Linking.openURL(androidAltUrl);
        } catch {
          await Linking.openURL(webUrl);
        }
      }
    }
  } catch (e) {
    console.error(e);
    // Last resort
    try {
      await Linking.openURL(webUrl);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to open YouTube');
    }
  }
}

// Optional convenience for opening the full set at 0:00
export function openYouTubeVideo(videoId) {
  return openYouTubeAt({ videoId, start: 0 });
}
