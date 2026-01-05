import { supabase } from '../lib/supabase';
import { searchDJSets } from './youtube';

export function normalizeDjName(name) {
  return (name || '').trim().toLowerCase();
}

export async function fetchAndSortDjSets(djName) {
  const q = (djName || '').trim();
  if (!q) return [];
  const freshSets = await searchDJSets(q);
  return [...freshSets].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
}

/**
 * Ensures a row exists in `djs` for this DJ name (normalized).
 * Returns djId (existing or newly created).
 */

export async function ensureDjRow({ name, thumbnailUrl = null }) {
  const clean = (name || '').trim();
  if (!clean) return null;

  // upsert by name_key (generated lower(name))
  const { data, error } = await supabase
    .from('djs')
    .upsert(
      { name: clean, image_url: thumbnailUrl ?? null },
      { onConflict: 'name_key' }
    )
    .select('id')
    .single();

  if (error) throw error;
  return data?.id ?? null;
}

