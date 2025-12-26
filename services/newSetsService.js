// services/newSetsService.js

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
