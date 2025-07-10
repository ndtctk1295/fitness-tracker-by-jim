/**
 * Timer utility functions for workout timer management
 */

/**
 * Helper to create a timer expiry timestamp
 * @param durationInSeconds - Duration in seconds for the timer
 * @returns Date object representing when the timer should expire
 */
export const createExpiryTimestamp = (durationInSeconds: number): Date => {
  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + durationInSeconds);
  return expiryTimestamp;
};
