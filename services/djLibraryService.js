// services/djLibraryService.js

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
