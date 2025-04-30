// src/context/SignalsContext.js
import React, { createContext, useState } from 'react';

export const SignalsContext = createContext();

export function SignalsProvider({ children }) {
  const [signals, setSignals] = useState([]);

  const addSignal = (newSignal) => {
    // newSignal içinde artık userId ve username olacak
    setSignals(prev => [newSignal, ...prev]);
  };

  return (
    <SignalsContext.Provider value={{ signals, addSignal }}>
      {children}
    </SignalsContext.Provider>
  );
}
