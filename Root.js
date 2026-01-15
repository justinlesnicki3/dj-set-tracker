// Root.js
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from './lib/supabase';
import AuthScreen from './screens/AuthScreen';
import App from './App';

export default function Root() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

   
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => {
      isMounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  
  if (!session) return <AuthScreen />;

  
  return <App />;
}
