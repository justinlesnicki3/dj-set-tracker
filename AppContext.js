import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchDJSets } from './services/youtube';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [trackedDJs, setTrackedDJs] = useState([]);
    const [djLibrary, setDjLibrary] = useState([]);
    const [myLeaks, setMyLeaks] = useState([]);
    const [newSets, setNewSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedSets, setSavedSets] = useState([]);
    const [hasInitialized, setHasInitialized] = useState(false);

    const addTrackedDJ = (dj) => {
        if (!dj || !dj.name) return;
        const cleanName = dj.name.trim().toLowerCase();
        setTrackedDJs((prev) => {
            if (prev.some((d) => d.name === cleanName)) return prev;
            return [...prev, { ...dj, name: cleanName, subscribeDate: new Date().toISOString() }];
        });
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

    const refreshTrackedDJs = async (djList) => {
        for (const dj of djList) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000);

                const results = await searchDJSets(dj.name, { signal: controller.signal });
                clearTimeout(timeout);

                for (const set of results) {
                    const fullSet = { ...set, djName: dj.name.toLowerCase() };

                // Save all sets, not just "new"
                setDjLibrary(prev =>
                    prev.some(s => s.id === fullSet.id) ? prev : [...prev, fullSet]
                );

                // Still track new sets separately if needed
                const isNew = new Date(set.publishDate) > new Date(dj.subscribeDate);
                if (isNew) {
                    setNewSets(prev =>
                        prev.some(s => s.id === fullSet.id) ? prev : [...prev, fullSet]
        );
    }
}
            } catch (err) {
                console.warn(`⚠️ Failed to fetch for ${dj.name}:`, err.message || err);
            }
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const libraryData = await AsyncStorage.getItem('djLibrary');
                const leaksData = await AsyncStorage.getItem('myLeaks');
                const trackedData = await AsyncStorage.getItem('trackedDJs');
                const saved = await AsyncStorage.getItem('savedSets');


                if (libraryData) setDjLibrary(JSON.parse(libraryData));
                if (leaksData) setMyLeaks(JSON.parse(leaksData));
                if (trackedData) {
                    const parsed = JSON.parse(trackedData);
                    setTrackedDJs(parsed);

                    setTimeout(() => refreshTrackedDJs(parsed), 1000);
                }
                if (saved) setSavedSets(JSON.parse(saved));

            } catch (e) {
                console.error("❌ Error during init:", e.message || e);
            } finally {
                setLoading(false);
                setHasInitialized(true);
            }
        };

        init();
    }, []);

    useEffect(() => {
        if (hasInitialized) {
            AsyncStorage.setItem('trackedDJs', JSON.stringify(trackedDJs));
        }
    }, [trackedDJs]);

    useEffect(() => {
        if (hasInitialized) {
            AsyncStorage.setItem('djLibrary', JSON.stringify(djLibrary));
        }
    }, [djLibrary]);

    useEffect(() => {
        if (hasInitialized) {
            AsyncStorage.setItem('myLeaks', JSON.stringify(myLeaks));
        }
    }, [myLeaks]);

    useEffect(() => {
        if (hasInitialized) {
            AsyncStorage.setItem('savedSets', JSON.stringify(savedSets));
        }
    }, [savedSets]);

    return (
        <AppContext.Provider
            value={{
                trackedDJs,
                addTrackedDJ,
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
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
