import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

export const SignalsContext = createContext({
  signals: [],
  addSignal: async () => {}
});

export function SignalsProvider({ children }) {
  const [signals, setSignals] = useState([]);

  // Supabase'ten gelen kaydı bizim modele çeviriyoruz
  const mapSignal = (r) => ({
    id: r.id,
    userId: r.user_id,
    username: r.username,
    symbol: r.symbol,
    direction: r.direction,
    timeFrame: r.timeframe,
    entryPrice: r.entry_price,
    recommendedLeverage: r.recommended_leverage,
    targets: [r.target1, r.target2, r.target3],
    stopLoss: r.stop_loss,
    timestamp: r.timestamp
  });

  // İlk yükleme: varolan sinyalleri çek
  const fetchSignals = async () => {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .order('timestamp', { ascending: false });
    if (!error && data) setSignals(data.map(mapSignal));
  };

  useEffect(() => {
    fetchSignals();

    // Realtime: yeni insert'leri dinle
    const chan = supabase
      .channel('signs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'signals' },
        payload => {
          setSignals(prev => [mapSignal(payload.new), ...prev]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(chan);
  }, []);

  // Yeni sinyal ekleme: önce optimistik ekle, sonra DB'ye insert
  const addSignal = async ({
    userId,
    username,
    symbol,
    direction,
    timeFrame,
    entryPrice,
    recommendedLeverage,
    targets,
    stopLoss,
    timestamp
  }) => {
    // 1) Anında ekle
    const temp = {
      id: `temp-${Date.now()}`,
      userId,
      username,
      symbol,
      direction,
      timeFrame,
      entryPrice,
      recommendedLeverage,
      targets,
      stopLoss,
      timestamp
    };
    setSignals(prev => [temp, ...prev]);

    // 2) DB'ye yaz
    const { data, error } = await supabase
      .from('signals')
      .insert({
        user_id: userId,
        username,
        symbol,
        direction,
        timeframe: timeFrame,
        entry_price: entryPrice,
        recommended_leverage: recommendedLeverage,
        target1: targets[0],
        target2: targets[1],
        target3: targets[2],
        stop_loss: stopLoss,
        timestamp
      })
      .select()
      .single();

    if (error) {
      console.error('Sinyal ekleme hatası:', error);
      return;
    }

    // 3) Gerçek satırı geçiciyle değiştir
    setSignals(prev =>
      prev.map(s => (s.id === temp.id ? mapSignal(data) : s))
    );
  };

  return (
    <SignalsContext.Provider value={{ signals, addSignal }}>
      {children}
    </SignalsContext.Provider>
  );
}
