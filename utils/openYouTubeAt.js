import { Linking } from 'react-native';

export async function openYouTubeAt({ videoId, start = 0 }) {
  if (!videoId) throw new Error('Missing videoId');

  const t = Math.max(0, Math.floor(Number(start) || 0));

  // Try YouTube app first
  const appUrl = `youtube://watch?v=${encodeURIComponent(videoId)}&start=${t}`;

  // Web fallback
  const webUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&t=${t}`;

  const canOpenApp = await Linking.canOpenURL(appUrl);
  if (canOpenApp) {
    await Linking.openURL(appUrl);
    return;
  }

  await Linking.openURL(webUrl);
}
