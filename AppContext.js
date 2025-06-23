import React, { createContext, useContext, useState} from 'react';

const AppContext = createContext();

export const AppProvider = ({children}) => {
    const [trackedDJs, setTrackedDJs] = useState([]);

    const addTrackedDJ = (djName) => {
        const cleanName = djName.trim().toLowerCase();
        if(!cleanName) return;
        setTrackedDJs((prev) => {
            if(prev.includes(cleanName)) return prev;
            return [...prev, cleanName];
        });
    };

    const [djLibrary, setDjLibrary, myLeaks, setMyLeaks] = useState([]);

    const addSetToLibrary = (set) => {
        setDjLibrary((prev) => {
            if (prev.some((item) => item.id === set.id)) return prev;
            return [...prev, set];
        });
    };

    const addLeak = (leak) => {
        setMyLeaks((prev) => [...prev, leak]);
    };



    return (
        <AppContext.Provider value={{trackedDJs, addTrackedDJ, djLibrary, addSetToLibrary, myLeaks, addLeak}}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);