export function sortSetsByNewest(sets = []) {
  return [...sets].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
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
  if (!Array.isArray(trackedDJs) || trackedDJs.length === 0) return;
  if (typeof refreshTrackedDJs !== 'function') return;
  await refreshTrackedDJs(trackedDJs);
}

// ✅ new: saved-state + save toggle
export function isSetSaved(savedSets = [], setItem) {
  const id = setItem?.id ?? setItem?.videoId;
  if (!id) return false;
  return savedSets.some((s) => (s?.id ?? s?.videoId) === id);
}

export function saveSetFlow({ setItem, isSaved, addSavedSet, removeSavedSet }) {
  const id = setItem?.id ?? setItem?.videoId;
  if (!id) return { ok: false };

  if (isSaved) {
    // removeSavedSet expects an id in your context
    removeSavedSet?.(id);
    return { ok: true, saved: false };
  }

  // addSavedSet expects full object
  addSavedSet?.(setItem);
  return { ok: true, saved: true };
}
