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
      djId: row.dj_id,
      name: normalizeName(row?.djs?.name),
      imageUrl: row?.djs?.image_url ?? null,
      subscribeDate: row.created_at, 
    }))
    .filter((d) => d.name);

  const savedSets = (savedRes.data || []).map((row) => ({
    id: row.video_id, 
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

  const [djLibrary, setDjLibrary] = useState([]);
  const [newSets, setNewSets] = useState([]);

  const [currentClip, setCurrentClip] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [loading, setLoading] = useState(true);

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


  const addSavedSet = async (setItem) => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const videoId = setItem?.videoId ?? setItem?.id;
      if (!videoId) return;

     
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

 
  const addPlaylist = async (name) => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const clean = (name || '').trim();
      if (!clean) return;

      
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

  useEffect(() => {
    if (loading) return;
    if (didInitialYouTubeRefresh.current) return;
    didInitialYouTubeRefresh.current = true;

    refreshTrackedDJs(trackedDJs).catch(() => {});
  }, [loading, trackedDJs]);

  const clearAllData = async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;

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

      console.log('All Supabase user data cleared');
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

        djLibrary,      
        addSetToLibrary: () => {}, 

        myLeaks: [], 
        addLeak,

        refreshTrackedDJs,
        newSets,        
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

        clearAllData, 
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
