import React, { useState } from 'react';

export default function useVisualMode(initial) {
  const [mode, setMode] = useState(initial);
  const [history, setHistory] = useState([initial]);

  const transition = (newMode, replace=false) => {
    const historyStack = history;
    if (replace) {
      historyStack[historyStack.length - 1] = newMode;
    } else {
      historyStack.push(newMode);
    }
      setMode(newMode);
      setHistory(historyStack);
  };

  const back = () => {
    const historyStack = history;
    if (historyStack.length <= 1) return;
    historyStack.pop();
    const prevMode = historyStack[historyStack.length - 1];
    setMode(prevMode);
  }

  return {
    mode,
    transition,
    back
  };
}