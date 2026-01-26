import { Linking } from 'react-native';

export async function openYouTubeAt({ videoId, start = 0 }) {
  if (!videoId) throw new Error('Missing videoId');

  const t = Math.max(0, Math.floor(Number(start) || 0));

  // Use web URL. On iOS, if YouTube is installed, Universal Links usually open the app automatically.
  // This avoids canOpenURL + LSApplicationQueriesSchemes issues in Expo Go.
  const webUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&t=${t}`;

  const supported = await Linking.canOpenURL(webUrl);
  if (!supported) throw new Error('No app can open YouTube links on this device.');

  await Linking.openURL(webUrl);
}
