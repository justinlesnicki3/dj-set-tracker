// services/searchService.js
import { Keyboard } from 'react-native';

export function normalizeDjName(name) {
  return (name || '').trim().toLowerCase();
}

export function filterDJs(database = [], searchTerm = '') {
  const q = normalizeDjName(searchTerm);
  if (!q) return [];
  return database.filter((dj) => normalizeDjName(dj.name).includes(q));
}

export function isDjSubscribed(trackedDJs = [], djName = '') {
  const key = normalizeDjName(djName);
  return trackedDJs.some((dj) => normalizeDjName(dj.name) === key);
}

export function findDjInDatabase(database = [], djName = '') {
  const key = normalizeDjName(djName);
  return database.find((dj) => normalizeDjName(dj.name) === key) || null;
}

export function buildDjDetailNavParams(djName) {
  return { djName };
}

export function subscribeFlow({ database, djName, addTrackedDJ }) {
  const djData = findDjInDatabase(database, djName);
  if (!djData) return { ok: false, message: 'DJ not found' };

  addTrackedDJ?.(djData);
  Keyboard.dismiss();
  return { ok: true };
}

export function unsubscribeFlow({ djName, removeTrackedDJ }) {
  removeTrackedDJ?.(normalizeDjName(djName));
}
