import { Linking, Platform } from 'react-native';

/**
 * Preferred usage:
 *   openYouTubeAt({ videoId: "abc123", start: 85 })
 *
 * Backwards-compatible usage:
 *   openYouTubeVideo("abc123")              // start defaults to 0
 *   openYouTubeVideo("abc123", 85)
 */

// Backwards-compatible wrapper (so old code keeps working)
export async function openYouTubeVideo(videoId, start = 0) {
  return openYouTubeAt({ videoId, start });
}

export async function openYouTubeAt({ videoId, start = 0 }) {
  if (!videoId) throw new Error('Missing videoId');

  const t = Math.max(0, Math.floor(Number(start) || 0));

  // iOS uses vnd.youtube scheme commonly; android often accepts it too.
  const appUrl =
    Platform.OS === 'ios'
      ? `vnd.youtube://${encodeURIComponent(videoId)}?t=${t}`
      : `vnd.youtube://${encodeURIComponent(videoId)}?t=${t}`;

  // Web fallback
  const webUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&t=${t}`;

  // Try app first
  const canOpenApp = await Linking.canOpenURL(appUrl);
  if (canOpenApp) {
    await Linking.openURL(appUrl);
    return;
  }

  // Fallback to web
  const canOpenWeb = await Linking.canOpenURL(webUrl);
  if (!canOpenWeb) throw new Error('No app can open YouTube links on this device.');
  await Linking.openURL(webUrl);
}
