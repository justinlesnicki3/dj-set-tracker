import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from './lib/supabase';
import { searchDJSets } from './services/youtube';

export const AppContext = createContext();

function normalizeName(name) {
  return (name || '').trim().toLowerCase();
}

async function getUserId() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}

/**
 * Ensures a DJ exists in `djs` and returns its id.
 * Matches your existing “ensureDjRow” concept.
 */
async function ensureDjRow({ name, imageUrl = null }) {
  const clean = (name || '').trim();
  if (!clean) return null;

  const { data: existing, error: selErr } = await supabase
    .from('djs')
    .select('id')
    .eq('name', clean)
    .maybeSingle();

  if (selErr) throw selErr;
  if (existing?.id) return existing.id;

  const { data: inserted, error: insErr } = await supabase
    .from('djs')
    .insert({ name: clean, image_url: imageUrl })
    .select('id')
    .single();

  if (insErr) throw insErr;
  return inserted?.id ?? null;
}

/**
 * Loads core app data for the logged-in user from Supabase.
 * - trackedDJs from subscriptions join djs
 * - savedSets from saved_sets
 * - playlists + clips from playlists and clips
 */
async function loadUserData() {
  const userId = await getUserId();
  if (!userId) {
    return {
      trackedDJs: [],
      savedSets: [],
      playlists: [],
      clips: [],
    };
  }

  const [subsRes, savedRes, playlistsRes, clipsRes] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('created_at, dj_id, djs:dj_id ( id, name, image_url )')
      .eq('user_id', userId),

    supabase
      .from('saved_sets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

    supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }),

    supabase
      .from('clips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }),
  ]);

  if (subsRes.error) throw subsRes.error;
  if (savedRes.error) throw savedRes.error;
  if (playlistsRes.error) throw playlistsRes.error;
  if (clipsRes.error) throw clipsRes.error;

  const trackedDJs = (subsRes.data || [])
    .map((row) => ({
      // keep your UI expectation: { name, subscribeDate }
      djId: row.dj_id,
      name: normalizeName(row?.djs?.name),
      imageUrl: row?.djs?.image_url ?? null,
      subscribeDate: row.created_at, // ISO from Supabase
    }))
    .filter((d) => d.name);

  const savedSets = (savedRes.data || []).map((row) => ({
    // shape matches your UI usage
    id: row.video_id, // your UI often expects item.id; use video_id as stable key
    videoId: row.video_id,
    title: row.title,
    thumbnail: row.thumbnail,
    djName: row.dj_name,
    publishDate: row.publish_date,
  }));

  const playlistRows = playlistsRes.data || [];
  const clipRows = clipsRes.data || [];

  const clipsByPlaylistId = clipRows.reduce((acc, c) => {
    const pid = c.playlist_id || '__NO_PLAYLIST__';
    if (!acc[pid]) acc[pid] = [];
    acc[pid].push({
      id: c.id,
      title: c.title,
      djSetTitle: c.dj_set_title,
      videoId: c.video_id,
      start: c.start,
      end: c.end,
      playlistId: c.playlist_id,
      createdAt: c.created_at,
    });
    return acc;
  }, {});

  // playlists[] must match your existing screens: { name, clips: [] }
  const playlists = playlistRows.map((p) => ({
    id: p.id,
    name: p.name,
    clips: clipsByPlaylistId[p.id] || [],
  }));

  return {
    trackedDJs,
    savedSets,
    playlists,
    clips: clipRows,
  };
}

export const AppProvider = ({ children }) => {
  const [trackedDJs, setTrackedDJs] = useState([]);
  const [savedSets, setSavedSets] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  // These can stay “runtime only” (derived from YouTube fetch)
  const [djLibrary, setDjLibrary] = useState([]);
  const [newSets, setNewSets] = useState([]);

  const [currentClip, setCurrentClip] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [loading, setLoading] = useState(true);

  // avoid refresh double-trigger
  const didInitialYouTubeRefresh = useRef(false);

  const isAuthed = useMemo(() => trackedDJs != null, [trackedDJs]);

  // ---------- Supabase load on mount + auth changes ----------
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      try {
        const userId = await getUserId();
        if (!userId) {
          if (!mounted) return;
          setTrackedDJs([]);
          setSavedSets([]);
          setPlaylists([]);
          setDjLibrary([]);
          setNewSets([]);
          return;
        }

        const data = await loadUserData();
        if (!mounted) return;

        setTrackedDJs(data.trackedDJs);
        setSavedSets(data.savedSets);
        setPlaylists(data.playlists);
      } catch (e) {
        console.log('❌ Supabase init error:', e?.message ?? e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      init();
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // ---------- TRACKED DJs (Supabase) ----------
  const addTrackedDJ = (dj) => {
  const cleanName = normalizeName(dj?.name);
  if (!cleanName) return;

  setTrackedDJs((prev) => {
    if (prev.some((d) => d.name === cleanName)) return prev;

    return [
      ...prev,
      {
        name: cleanName,
        imageUrl: dj?.image_url ?? dj?.imageUrl ?? null,
        subscribeDate: new Date().toISOString(),
        // optional: store djId if you already have it
        djId: dj?.djId ?? dj?.id ?? null,
      },
    ];
  });
};

  const removeTrackedDJ = (djName) => {
  const clean = normalizeName(djName);
  if (!clean) return;
  setTrackedDJs((prev) => prev.filter((dj) => dj.name !== clean));
};


  // ---------- SAVED SETS (Supabase) ----------
  const addSavedSet = async (setItem) => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const videoId = setItem?.videoId ?? setItem?.id;
      if (!videoId) return;

      // local dedupe
      if (savedSets.some((s) => (s.videoId ?? s.id) === videoId)) return;

      const payload = {
        user_id: userId,
        video_id: videoId,
        title: setItem?.title ?? '',
        thumbnail: setItem?.thumbnail ?? null,
        dj_name: setItem?.djName ?? null,
        publish_date: setItem?.publishDate ?? null,
      };

      const { error } = await supabase.from('saved_sets').insert(payload);
      if (error) throw error;

      setSavedSets((prev) => [
        { ...payload, id: videoId, videoId },
        ...prev,
      ]);
    } catch (e) {
      console.log('addSavedSet error:', e?.message ?? e);
    }
  };

  const removeSavedSet = async (setIdOrVideoId) => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const videoId = setIdOrVideoId;
      if (!videoId) return;

      const { error } = await supabase
        .from('saved_sets')
        .delete()
        .eq('user_id', userId)
        .eq('video_id', videoId);

      if (error) throw error;

      setSavedSets((prev) => prev.filter((s) => (s.videoId ?? s.id) !== videoId));
    } catch (e) {
      console.log('removeSavedSet error:', e?.message ?? e);
    }
  };

  // ---------- PLAYLISTS + CLIPS (Supabase) ----------
  const addPlaylist = async (name) => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const clean = (name || '').trim();
      if (!clean) return;

      // local dedupe by name
      if (playlists.some((p) => p.name.toLowerCase() === clean.toLowerCase())) return;

      const { data, error } = await supabase
        .from('playlists')
        .insert({ user_id: userId, name: clean })
        .select('*')
        .single();

      if (error) throw error;

      setPlaylists((prev) => [...prev, { id: data.id, name: data.name, clips: [] }]);
    } catch (e) {
      console.log('addPlaylist error:', e?.message ?? e);
    }
  };

  const removePlaylist = async (name) => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const match = playlists.find((p) => p.name === name);
      if (!match?.id) {
        setPlaylists((prev) => prev.filter((p) => p.name !== name));
        return;
      }

      // cascades clips because FK on clips.playlist_id uses on delete cascade
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('user_id', userId)
        .eq('id', match.id);

      if (error) throw error;

      setPlaylists((prev) => prev.filter((p) => p.id !== match.id));
    } catch (e) {
      console.log('removePlaylist error:', e?.message ?? e);
    }
  };

  const addLeak = async (leak) => {
    // “leak” not tied to playlist in your UI anymore — we can store it as a clip with playlist_id = null
    try {
      const userId = await getUserId();
      if (!userId) return;
      if (!leak?.videoId || !leak?.start || !leak?.end || !leak?.title) return;

      const payload = {
        user_id: userId,
        playlist_id: null,
        video_id: leak.videoId,
        title: leak.title,
        dj_set_title: leak.djSetTitle ?? null,
        start: leak.start,
        end: leak.end,
      };

      const { error } = await supabase.from('clips').insert(payload);
      if (error) throw error;

      // you can ignore local update since UI is playlist based,
      // but leaving no-op keeps compatibility
    } catch (e) {
      console.log('addLeak error:', e?.message ?? e);
    }
  };

  const addClipToPlaylist = async (playlistName, clip) => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const name = (playlistName || '').trim();
      if (!name) return;
      if (!clip?.videoId || !clip?.start || !clip?.end || !clip?.title) return;

      // ensure playlist exists
      let pl = playlists.find((p) => p.name === name);

      if (!pl) {
        const { data, error } = await supabase
          .from('playlists')
          .insert({ user_id: userId, name })
          .select('*')
          .single();
        if (error) throw error;

        pl = { id: data.id, name: data.name, clips: [] };
        setPlaylists((prev) => [...prev, pl]);
      }

      // insert clip
      const payload = {
        user_id: userId,
        playlist_id: pl.id,
        video_id: clip.videoId,
        title: clip.title,
        dj_set_title: clip.djSetTitle ?? null,
        start: clip.start,
        end: clip.end,
      };

      const { data: inserted, error } = await supabase
        .from('clips')
        .insert(payload)
        .select('*')
        .single();

      if (error) throw error;

      // update local playlist clips
      setPlaylists((prev) =>
        prev.map((p) => {
          if (p.id !== pl.id) return p;
          const exists = p.clips.some((c) => c.id === inserted.id);
          if (exists) return p;
          return {
            ...p,
            clips: [
              ...p.clips,
              {
                id: inserted.id,
                title: inserted.title,
                djSetTitle: inserted.dj_set_title,
                videoId: inserted.video_id,
                start: inserted.start,
                end: inserted.end,
                playlistId: inserted.playlist_id,
                createdAt: inserted.created_at,
              },
            ],
          };
        })
      );
    } catch (e) {
      console.log('addClipToPlaylist error:', e?.message ?? e);
    }
  };

  const removeClipFromPlaylist = async (playlistName, clipId) => {
    try {
      const userId = await getUserId();
      if (!userId) return;
      if (!clipId) return;

      const { error } = await supabase
        .from('clips')
        .delete()
        .eq('user_id', userId)
        .eq('id', clipId);

      if (error) throw error;

      setPlaylists((prev) =>
        prev.map((p) => {
          if (p.name !== playlistName) return p;
          return { ...p, clips: p.clips.filter((c) => c.id !== clipId) };
        })
      );
    } catch (e) {
      console.log('removeClipFromPlaylist error:', e?.message ?? e);
    }
  };

  // ---------- YOUTUBE REFRESH (runtime only) ----------
  // Rule: NewSets if (posted last 30 days) OR (posted after subscribeDate)
  const refreshTrackedDJs = async (djList) => {
    if (!Array.isArray(djList) || djList.length === 0) return;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    for (const dj of djList) {
      try {
        const results = await searchDJSets(dj.name);

        for (const set of results) {
          const fullSet = { ...set, djName: (dj.name || '').toLowerCase() };

          setDjLibrary((prev) =>
            prev.some((s) => s.id === fullSet.id) ? prev : [...prev, fullSet]
          );

          const publishDate = new Date(set.publishDate);
          const subscribeDate = new Date(dj.subscribeDate);

          const isNew =
            publishDate >= cutoff ||
            publishDate >= subscribeDate;

          if (isNew) {
            setNewSets((prev) =>
              prev.some((s) => s.id === fullSet.id) ? prev : [...prev, fullSet]
            );
          }
        }
      } catch (err) {
        console.warn(`⚠️ Failed to fetch for ${dj.name}:`, err?.message || err);
      }
    }
  };

  // optional: auto refresh once after initial load (Supabase -> YouTube)
  useEffect(() => {
    if (loading) return;
    if (didInitialYouTubeRefresh.current) return;
    didInitialYouTubeRefresh.current = true;

    refreshTrackedDJs(trackedDJs).catch(() => {});
  }, [loading, trackedDJs]);

  // ---------- CLEAR LOCAL USER DATA (Supabase) ----------
  const clearAllData = async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      // Delete in safe order (clips -> playlists, etc)
      await supabase.from('clips').delete().eq('user_id', userId);
      await supabase.from('playlists').delete().eq('user_id', userId);
      await supabase.from('saved_sets').delete().eq('user_id', userId);
      await supabase.from('subscriptions').delete().eq('user_id', userId);

      setTrackedDJs([]);
      setSavedSets([]);
      setPlaylists([]);
      setDjLibrary([]);
      setNewSets([]);
      setCurrentClip(null);
      setIsPlaying(false);

      console.log('✅ All Supabase user data cleared');
    } catch (e) {
      console.log('Error clearing supabase data', e?.message ?? e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        trackedDJs,
        addTrackedDJ,
        removeTrackedDJ,

        djLibrary,      // runtime only
        addSetToLibrary: () => {}, // optional: no-op since savedSets is the real library

        myLeaks: [], // optional legacy; playlists is the real structure now
        addLeak,

        refreshTrackedDJs,
        newSets,        // runtime only
        loading,

        savedSets,
        addSavedSet,
        removeSavedSet,

        playlists,
        addPlaylist,
        addClipToPlaylist,
        removeClipFromPlaylist,
        removePlaylist,

        currentClip,
        setCurrentClip,
        isPlaying,
        setIsPlaying,

        clearAllData, // now clears Supabase instead of AsyncStorage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
