// services/djDetailService.js
import { supabase } from '../lib/supabase';
import { searchDJSets } from './youtube';

export async function fetchAndSortDjSets(djName) {
  if (!djName?.trim()) return [];
  const freshSets = await searchDJSets(djName.trim());
  return [...freshSets].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
}

/**
 * Ensures a row exists in `djs` table for this DJ name.
 * Returns djId (existing or newly created).
 */
export async function ensureDjRow({ name, thumbnailUrl = null }) {
  const normalizedName = (name || '').trim();
  if (!normalizedName) return null;

  const { data: existing, error: selErr } = await supabase
    .from('djs')
    .select('id')
    .eq('name', normalizedName)
    .maybeSingle();

  if (selErr) throw selErr;
  if (existing?.id) return existing.id;

  const { data: inserted, error: insErr } = await supabase
    .from('djs')
    .insert({ name: normalizedName, image_url: thumbnailUrl })
    .select('id')
    .single();

  if (insErr) throw insErr;
  return inserted?.id ?? null;
}
