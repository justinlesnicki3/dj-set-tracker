import { Linking } from 'react-native';

export async function openYouTubeAt({ videoId, start = 0 }) {
  if (!videoId) throw new Error('Missing videoId');

  const t = Math.max(0, Number(start) || 0);

  // Try YouTube app first
  const appUrl = `youtube://www.youtube.com/watch?v=${videoId}&t=${t}`;
  // Fall back to web
  const webUrl = `https://www.youtube.com/watch?v=${videoId}&t=${t}`;

  const canOpenApp = await Linking.canOpenURL(appUrl);
  if (canOpenApp) {
    await Linking.openURL(appUrl);
    return;
  }

  const canOpenWeb = await Linking.canOpenURL(webUrl);
  if (!canOpenWeb) throw new Error('No app can open YouTube links on this device.');

  await Linking.openURL(webUrl);
}
