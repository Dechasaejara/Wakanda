import { useState, useRef, useCallback, useEffect } from "react";

// Pass initialTime to the hook, not directly to useState
export function useTimer(defaultTime: number, onTimeout: () => void) {
  // Initialize timeLeft with defaultTime, but allow it to be updated
  const [timeLeft, setTimeLeft] = useState(defaultTime);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Store onTimeout in a ref to avoid dependency issues in useCallback
  const onTimeoutRef = useRef(onTimeout);

  // Keep the ref updated if the onTimeout function changes
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []); // No dependencies needed for stopTimer

  // --- FIX START ---
  // Accept an optional newTime parameter
  const startTimer = useCallback((newTime?: number) => {
      stopTimer(); // Clear any existing timer
      // Use newTime if provided, otherwise fallback to defaultTime
      const timeToSet = newTime !== undefined ? newTime : defaultTime;
      setTimeLeft(timeToSet); // Set the initial time for this countdown

      if (timeToSet > 0) { // Only start interval if time > 0
          timerRef.current = setInterval(() => {
              setTimeLeft((prev) => {
                  if (prev <= 1) {
                      stopTimer(); // Stop timer before calling timeout
                      onTimeoutRef.current(); // Call the latest timeout function via ref
                      return 0;
                  }
                  return prev - 1;
              });
          }, 1000);
      }
   // Include defaultTime and stopTimer in dependencies
  }, [defaultTime, stopTimer]);
  // --- FIX END ---


  // Cleanup timer on component unmount
  useEffect(() => {
    return stopTimer;
  }, [stopTimer]);

  return { timeLeft, startTimer, stopTimer };
}