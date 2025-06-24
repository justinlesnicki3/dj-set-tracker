import React, { createContext, useContext, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { searchDJSets } from './services/youtube';

const AppContext = createContext();

export const AppProvider = ({children}) => {
    const [trackedDJs, setTrackedDJs] = useState([]);

    const addTrackedDJ = (djName) => {
        const cleanName = djName.trim().toLowerCase();
        if(!cleanName) return;
        setTrackedDJs((prev) => {
            if (prev.some((dj) => dj.name === cleanName)) return prev;
            return [...prev, {
                name: cleanName,
                subscribeDate: new Date().toISOString()
            }];
        });
    };

    const [djLibrary, setDjLibrary] = useState([]);
    const [myLeaks, setMyLeaks] = useState([]);
    const [newSets, setNewSets] = useState([]);

    const addSetToLibrary = (set) => {
        setDjLibrary((prev) => {
            if (prev.some((item) => item.id === set.id)) return prev;
            return [...prev, set];
        });
    };

    const addLeak = (leak) => {
        setMyLeaks((prev) => [...prev, leak]);
    };

    const refreshTrackedDJs = async () => {
        console.log("🔄 Refreshing tracked DJs:", trackedDJs);

        for(const dj of trackedDJs) {
            const results = await searchDJSets(dj.name);
            console.log(`✅ Found ${results.length} sets for ${dj.name}`);

            for (const set of results) {
                const publishDate = set.publishDate;

                if(new Date(publishDate) > new Date(dj.subscribeDate)) {
                    setNewSets((prev) => {
                        if (prev.some((item) => item.id === set.id)) return prev;
                        return [...prev, {...set, djName: dj.name, publishDate}];
                    });

                    setDjLibrary((prev => {
                        if (prev.some((item) => item.id === set.id)) return prev;
                        return [...prev, set];
                    }))
                }
            }
        }
    };

    useEffect(() => {
        const loadData = async () => {
            const libraryData = await AsyncStorage.getItem('djLibrary');
            const leaksData = await AsyncStorage.getItem('myLeaks');
            const trackedData = await AsyncStorage.getItem('trackedDJs');

            if(libraryData) setDjLibrary(JSON.parse(libraryData));
            if(leaksData) setMyLeaks(JSON.parse(leaksData));
            if(trackedData) setTrackedDJs(JSON.parse(trackedData));
        };

        loadData();
    }, []);

    useEffect(() => {
        if (trackedDJs.length > 0) {
            refreshTrackedDJs();
        }
    }, [trackedDJs]);

    useEffect(() => {
        AsyncStorage.setItem('myLeaks', JSON.stringify(myLeaks));
    }, [myLeaks]);

    useEffect(() => {
        AsyncStorage.setItem('djLibrary', JSON.stringify(djLibrary));
    }, [djLibrary]);

    useEffect(() => {
        AsyncStorage.setItem('trackedDJs', JSON.stringify(trackedDJs));
    }, [trackedDJs]);




    return (
        <AppContext.Provider value={{trackedDJs, addTrackedDJ, djLibrary, addSetToLibrary, myLeaks, addLeak, refreshTrackedDJs, newSets}}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);