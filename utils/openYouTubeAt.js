// utils/openYouTubeAt.js
import { Linking, Alert } from 'react-native';

export async function openYouTubeAt({ videoId, start = 0 }) {
  if (!videoId) throw new Error('Missing videoId');

  const t = Math.max(0, Math.floor(Number(start) || 0));

  // Try YouTube app first (multiple schemes for reliability)
  const youtubeSchemeUrl = `youtube://watch?v=${encodeURIComponent(videoId)}&t=${t}`;
  const vndSchemeUrl = `vnd.youtube://${encodeURIComponent(videoId)}?t=${t}`;

  // Web fallback
  const webUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&t=${t}`;

  // 1) Try youtube://
  const canOpenYoutube = await Linking.canOpenURL(youtubeSchemeUrl);
  if (canOpenYoutube) {
    await Linking.openURL(youtubeSchemeUrl);
    return;
  }

  // 2) Try vnd.youtube:// (often works better on iOS)
  const canOpenVnd = await Linking.canOpenURL(vndSchemeUrl);
  if (canOpenVnd) {
    await Linking.openURL(vndSchemeUrl);
    return;
  }

  // 3) Fallback to web
  const canOpenWeb = await Linking.canOpenURL(webUrl);
  if (!canOpenWeb) {
    Alert.alert('Cannot open YouTube', 'No app can open YouTube links on this device.');
    return;
  }

  await Linking.openURL(webUrl);
}

// ✅ Fixes: "openYouTubeVideo is not a function"
export const openYouTubeVideo = openYouTubeAt;
