import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchDJSets } from './services/youtube';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [trackedDJs, setTrackedDJs] = useState([]);
  const [djLibrary, setDjLibrary] = useState([]);
  const [myLeaks, setMyLeaks] = useState([]);
  const [newSets, setNewSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedSets, setSavedSets] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentClip, setCurrentClip] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // prevents double refresh on initial load
  const didInitialRefresh = useRef(false);

  const addTrackedDJ = (dj) => {
    if (!dj || !dj.name) return;
    const cleanName = dj.name.trim().toLowerCase();

    setTrackedDJs((prev) => {
      if (prev.some((d) => d.name === cleanName)) return prev;
      return [
        ...prev,
        { ...dj, name: cleanName, subscribeDate: new Date().toISOString() }
      ];
    });
  };

  const removeTrackedDJ = (djName) => {
    const clean = djName.trim().toLowerCase();
    setTrackedDJs((prev) => prev.filter((dj) => dj.name !== clean));
  };

  const addSavedSet = (set) => {
    setSavedSets((prev) => {
      if (prev.some((s) => s.id === set.id)) return prev;
      return [...prev, set];
    });
  };

  const removeSavedSet = (setId) => {
    setSavedSets((prev) => prev.filter((s) => s.id !== setId));
  };

  const addSetToLibrary = (set) => {
    setDjLibrary((prev) => {
      if (prev.some((s) => s.id === set.id)) return prev;
      return [...prev, set];
    });
  };

  const addLeak = (leak) => {
    setMyLeaks((prev) => [...prev, leak]);
  };

  const addPlaylist = (name) => {
    const clean = name.trim().toLowerCase();
    setPlaylists((prev) => {
      if (prev.some((p) => p.name.toLowerCase() === clean)) return prev;
      return [...prev, { name, clips: [] }];
    });
  };

  const addClipToPlaylist = (playlistName, clip) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.name === playlistName) {
          if (p.clips.some((c) => c.id === clip.id)) return p;
          return { ...p, clips: [...p.clips, clip] };
        }
        return p;
      })
    );
  };

  const removeClipFromPlaylist = (playlistName, clipId) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.name === playlistName) {
          return { ...p, clips: p.clips.filter((c) => c.id !== clipId) };
        }
        return p;
      })
    );
  };

  const removePlaylist = (name) => {
    setPlaylists((prev) => prev.filter((p) => p.name !== name));
  };

  // ✅ Pull sets for tracked DJs; populate djLibrary and newSets
  // New rule: in NewSets if (posted in last 30 days) OR (posted after subscribeDate)
  const refreshTrackedDJs = async (djList) => {
    if (!Array.isArray(djList) || djList.length === 0) return;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    for (const dj of djList) {
      try {
        const results = await searchDJSets(dj.name);

        for (const set of results) {
          const fullSet = { ...set, djName: (dj.name || '').toLowerCase() };

          // Always add to library
          setDjLibrary((prev) =>
            prev.some((s) => s.id === fullSet.id) ? prev : [...prev, fullSet]
          );

          const publishDate = new Date(set.publishDate);
          const subscribeDate = new Date(dj.subscribeDate);

          const isNew =
            publishDate >= cutoff ||      // ✅ backfill last 30 days
            publishDate >= subscribeDate; // ✅ forward tracking from subscribe

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

  // ✅ INIT: load from storage
  useEffect(() => {
    const init = async () => {
      try {
        const libraryData = await AsyncStorage.getItem('djLibrary');
        const leaksData = await AsyncStorage.getItem('myLeaks');
        const trackedData = await AsyncStorage.getItem('trackedDJs');
        const saved = await AsyncStorage.getItem('savedSets');
        const playlistData = await AsyncStorage.getItem('playlists');

        if (playlistData) setPlaylists(JSON.parse(playlistData));
        if (libraryData) setDjLibrary(JSON.parse(libraryData));
        if (leaksData) setMyLeaks(JSON.parse(leaksData));
        if (saved) setSavedSets(JSON.parse(saved));

        if (trackedData) {
          const parsed = JSON.parse(trackedData);
          setTrackedDJs(parsed);
        }
      } catch (e) {
        console.error('❌ Error during init:', e?.message || e);
      } finally {
        setLoading(false);
        setHasInitialized(true);
      }
    };

    init();
  }, []);

  // ✅ Refresh on tracked DJ changes (subscribe/unsubscribe), but avoid double-run on first load
  useEffect(() => {
    if (!hasInitialized) return;

    // first time after init: do one refresh
    if (!didInitialRefresh.current) {
      didInitialRefresh.current = true;
    }

    refreshTrackedDJs(trackedDJs).catch((err) =>
      console.warn('Error refreshing tracked DJs:', err)
    );
  }, [trackedDJs, hasInitialized]);

  // ✅ Persist
  useEffect(() => {
    if (hasInitialized) AsyncStorage.setItem('trackedDJs', JSON.stringify(trackedDJs));
  }, [trackedDJs, hasInitialized]);

  useEffect(() => {
    if (hasInitialized) AsyncStorage.setItem('djLibrary', JSON.stringify(djLibrary));
  }, [djLibrary, hasInitialized]);

  useEffect(() => {
    if (hasInitialized) AsyncStorage.setItem('myLeaks', JSON.stringify(myLeaks));
  }, [myLeaks, hasInitialized]);

  useEffect(() => {
    if (hasInitialized) AsyncStorage.setItem('savedSets', JSON.stringify(savedSets));
  }, [savedSets, hasInitialized]);

  useEffect(() => {
    if (hasInitialized) AsyncStorage.setItem('playlists', JSON.stringify(playlists));
  }, [playlists, hasInitialized]);

  return (
    <AppContext.Provider
      value={{
        trackedDJs,
        addTrackedDJ,
        removeTrackedDJ,
        djLibrary,
        addSetToLibrary,
        myLeaks,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export async function clearAllData() {
  try {
    await AsyncStorage.clear();
    console.log('All local data cleared');
  } catch (e) {
    console.log('Error clearing storage', e);
  }
}

export const useAppContext = () => useContext(AppContext);
