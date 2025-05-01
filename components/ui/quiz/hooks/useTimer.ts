import { useState, useRef, useCallback } from "react";

export function useTimer(initialTime: number, onTimeout: () => void) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(initialTime);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [initialTime, onTimeout]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return { timeLeft, startTimer, stopTimer };
}