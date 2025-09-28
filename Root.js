import React, {useEffect, useState} from 'react';
import {supabase} from './lib/supabase';
import AuthScreen from './screens/AuthScreen';
import App from './App';

export default function Root() {
    const [session, setSession] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({data}) => setSession(data.session ?? null));
        const {data: sub} = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
        return () => sub.subscription.unsubscribe();  
    }, []);

    if (!session) return <AuthScreen/>;
    return <App />;
}