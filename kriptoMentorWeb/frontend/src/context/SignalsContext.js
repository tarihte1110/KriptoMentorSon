// src/context/SignalsContext.js
import React, { createContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export const SignalsContext = createContext({
  signals: [],
  addSignal: async () => {}
})

export function SignalsProvider({ children }) {
  const [signals, setSignals] = useState([])

  // Satır verisini JS modeline çeviren yardımcı
  const mapSignal = r => ({
    id: r.id,
    userId: r.user_id,
    username: r.username,
    symbol: r.symbol,
    direction: r.direction,
    timeFrame: r.timeframe,            // kolon adınız buysa
    entryPrice: r.entry_price,         // yoksa entryPrice: r.entryPrice
    recommendedLeverage: r.recommended_leverage,
    targets: [r.target1, r.target2, r.target3],
    stopLoss: r.stop_loss,
    timestamp: r.timestamp
  })

  useEffect(() => {
    // İlk yükleme
    supabase
      .from('signals')
      .select('*')
      .order('timestamp', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setSignals(data.map(mapSignal))
      })

    // Realtime insert dinleme
    const channel = supabase
      .channel('signals')
      .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'signals' },
          payload => {
            setSignals(prev => [ mapSignal(payload.new), ...prev ])
          }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  // Yeni sinyal eklemek için
  const addSignal = async sig => {
    // Optimistik olarak ekle
    const temp = { ...sig, id: 'temp-' + Date.now() }
    setSignals(prev => [temp, ...prev])

    // DB'ye yaz
    const { data, error } = await supabase
      .from('signals')
      .insert({
        user_id: sig.userId,
        username: sig.username,
        symbol: sig.symbol,
        direction: sig.direction,
        timeframe: sig.timeFrame,
        entry_price: sig.entryPrice,
        recommended_leverage: sig.recommendedLeverage,
        target1: sig.targets[0],
        target2: sig.targets[1],
        target3: sig.targets[2],
        stop_loss: sig.stopLoss,
        timestamp: sig.timestamp
      })
      .select()
      .single()

    if (!error) {
      // Geçici kaydı gerçeği ile değiştir
      setSignals(prev =>
        prev.map(s => (s.id === temp.id ? mapSignal(data) : s))
      )
    }
  }

  return (
    <SignalsContext.Provider value={{ signals, addSignal }}>
      {children}
    </SignalsContext.Provider>
  )
}
