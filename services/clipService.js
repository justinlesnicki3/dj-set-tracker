// services/clipService.js

export function validateClipInputs({ start, end, clipTitle }) {
  if (!start || !end || !clipTitle?.trim()) {
    return { ok: false, message: 'Please enter a title, start time, and end time' };
  }
  return { ok: true };
}

export function buildLeak({ videoId, start, end, clipTitle, djSetTitle }) {
  return {
    id: `${videoId}-${start}-${end}`,
    title: clipTitle.trim(),
    djSetTitle,
    videoId,
    start,
    end,
  };
}

export function resolvePlaylistName({ newPlaylistName, selectedPlaylist }) {
  return (newPlaylistName?.trim() || selectedPlaylist || '').trim();
}

/**
 * Applies all context updates needed to save a leak + optionally put it in a playlist.
 * Keeps context-specific code here, but still under /services like you want.
 */
export function saveLeakFlow({
  leak,
  playlistName,
  playlists,
  addLeak,
  addPlaylist,
  addClipToPlaylist,
}) {
  addLeak(leak);

  if (playlistName) {
    const exists = playlists?.some((p) => p.name === playlistName);
    if (!exists) addPlaylist(playlistName);
    addClipToPlaylist(playlistName, leak);
  }

  return { ok: true, playlistName };
}
