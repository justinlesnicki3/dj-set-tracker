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

/**
 * Triggers a refresh of sets for currently tracked DJs.
 * Keeps UI dumb (screen just calls this).
 */
export async function refreshNewSetsFlow({ trackedDJs, refreshTrackedDJs }) {
  if (!Array.isArray(trackedDJs) || trackedDJs.length === 0) return;
  if (typeof refreshTrackedDJs !== 'function') return;

  // refreshTrackedDJs is your existing "backend" fetch logic in context.
  await refreshTrackedDJs(trackedDJs);
}
