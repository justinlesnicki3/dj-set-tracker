export function buildClipNavParams(setItem) {
  return {
    title: setItem?.title ?? '',
    videoId: setItem?.videoId ?? null,
  };
}

export function removeSavedSetById(removeSavedSetFn, id) {
  if (!id) return;
  removeSavedSetFn?.(id);
}

export function keyForSavedSet(item, index) {
  return item?.id ?? item?.videoId ?? String(index);
}

export function buildYouTubeVideoId(setItem) {
  return setItem?.videoId ?? setItem?.id ?? null;
}

export function isExpanded(expandedId, item) {
  const id = item?.id ?? item?.videoId ?? null;
  return !!id && expandedId === id;
}

export function toggleExpandedId(currentExpandedId, item) {
  const id = item?.id ?? item?.videoId ?? null;
  if (!id) return null;
  return currentExpandedId === id ? null : id;
}
