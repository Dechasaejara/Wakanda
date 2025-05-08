import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Custom hook for managing a countdown timer.
 * @param defaultTime - The default time in seconds for the countdown.
 * @param onTimeout - Callback function to execute when the timer reaches zero.
 */
export function useTimer(defaultTime: number, onTimeout: () => void) {
  const [timeLeft, setTimeLeft] = useState(defaultTime);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Use a ref for the callback to avoid it being a dependency of startTimer/stopTimer
  // This ensures the timer doesn't restart if only the onTimeout callback identity changes.
  const onTimeoutRef = useRef(onTimeout);

  // Keep the ref updated if the onTimeout function instance changes
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  // Stops the currently running timer. Memoized for stable identity.
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []); // No dependencies needed

  // Starts the timer. Can be called with a new time limit. Memoized for stable identity.
  const startTimer = useCallback((newTime?: number) => {
      stopTimer(); // Clear any existing timer first
      // Determine the time limit for this specific countdown instance
      const timeToSet = newTime !== undefined ? newTime : defaultTime;
      setTimeLeft(timeToSet);

      // Only start the interval if there's time to countdown
      if (timeToSet > 0) {
          timerRef.current = setInterval(() => {
              setTimeLeft((prev) => {
                  // Check if timer should stop
                  if (prev <= 1) {
                      stopTimer(); // Stop the interval
                      onTimeoutRef.current(); // Execute the timeout callback via ref
                      return 0; // Reset time displayed to 0
                  }
                  // Otherwise, decrement time
                  return prev - 1;
              });
          }, 1000); // Run every second
      }
   // Dependencies: defaultTime (for fallback) and stopTimer (to clear interval)
  }, [defaultTime, stopTimer]);

  // Cleanup effect: Ensure timer is stopped if the hook unmounts.
  useEffect(() => {
    // Return the stopTimer function to be called on cleanup
    return stopTimer;
  }, [stopTimer]); // Depends only on stopTimer's stable identity

  return { timeLeft, startTimer, stopTimer };
}