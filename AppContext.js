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
    return (
        <AppContext.Provider value={{trackedDJs, addTrackedDJ }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);