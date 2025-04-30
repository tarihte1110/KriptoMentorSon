// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { supabase } from './src/api/supabase';
import { SignalsProvider } from './src/context/SignalsContext';

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Uygulama başladığında mevcut oturumu al
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Oturum durumu değişikliklerini dinle
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Cleanup: dinleyiciyi kaldır
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SignalsProvider>
      <NavigationContainer>
        <AppNavigator session={session} />
      </NavigationContainer>
    </SignalsProvider>
  );
}
