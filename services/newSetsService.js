// services/newSetsService.js (or whatever this file is named)

export function sortSetsByNewest(sets = []) {
  return [...sets].sort(
    (a, b) => new Date(b?.publishDate).getTime() - new Date(a?.publishDate).getTime()
  );
}

export function formatPostedDate(dateString) {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
}

export function keyForSet(item, index) {
  return item?.id ?? item?.videoId ?? String(index);
}

export async function refreshNewSetsFlow({ trackedDJs, refreshTrackedDJs }) {
  if (!Array.isArray(trackedDJs) || trackedDJs.length === 0) return { ok: false };
  if (typeof refreshTrackedDJs !== 'function') return { ok: false };

  await refreshTrackedDJs(trackedDJs);
  return { ok: true };
}

export function isSetSaved(savedSets = [], setItem) {
  const id = setItem?.id ?? setItem?.videoId;
  if (!id) return false;
  return savedSets.some((s) => (s?.id ?? s?.videoId) === id);
}

/**
 * IMPORTANT:
 * Your addSavedSet/removeSavedSet are async (Supabase).
 * So this flow should be async + awaited by the caller.
 */
export async function saveSetFlow({ setItem, isSaved, addSavedSet, removeSavedSet }) {
  const id = setItem?.id ?? setItem?.videoId;
  if (!id) return { ok: false };

  if (isSaved) {
    if (typeof removeSavedSet === 'function') {
      await removeSavedSet(id);
    }
    return { ok: true, saved: false };
  }

  if (typeof addSavedSet === 'function') {
    await addSavedSet(setItem);
  }
  return { ok: true, saved: true };
}
