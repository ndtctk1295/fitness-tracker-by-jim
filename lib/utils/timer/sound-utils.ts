/**
 * Sound utility functions for timer sound management
 */

/**
 * Test sound functionality and check for audio permissions
 * @param setSoundPermissionStatus - Function to update sound permission status
 * @returns Promise<boolean> - True if sound test was successful
 */
export const testSound = async (
  setSoundPermissionStatus: (status: string) => void
): Promise<boolean> => {
  try {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);

    setSoundPermissionStatus('granted');
    return true;
  } catch (error) {
    console.error('Sound test failed:', error);
    setSoundPermissionStatus('denied');
    return false;
  }
};

/**
 * Play sound when timer completes
 * @param isSoundEnabled - Whether sound is enabled
 */
export const playTimerEndSound = (isSoundEnabled: boolean): void => {
  if (!isSoundEnabled) return;

  try {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Use a beep sound that's more noticeable
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // Higher pitch
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    // Play beep pattern
    oscillator.start();

    // Play for 0.2 seconds
    oscillator.stop(audioContext.currentTime + 0.2);

    // Play another beep after a short delay
    setTimeout(() => {
      const secondOscillator = audioContext.createOscillator();
      const secondGain = audioContext.createGain();

      secondOscillator.connect(secondGain);
      secondGain.connect(audioContext.destination);

      secondOscillator.frequency.setValueAtTime(
        1000,
        audioContext.currentTime
      ); // Even higher pitch
      secondGain.gain.setValueAtTime(0.3, audioContext.currentTime);

      secondOscillator.start();
      secondOscillator.stop(audioContext.currentTime + 0.2);
    }, 300);
  } catch (error) {
    console.error('Failed to play timer end sound:', error);
  }
};

/**
 * Check for audio permissions on component mount
 * @param setSoundPermissionStatus - Function to update sound permission status
 */
export const checkAudioPermission = async (
  setSoundPermissionStatus: (status: string) => void
): Promise<void> => {
  try {
    // Try to play a silent sound to check permissions
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const testSound = audioContext.createOscillator();
    testSound.connect(audioContext.destination);
    testSound.start();
    testSound.stop(0.1);
    setSoundPermissionStatus('granted');
  } catch (error) {
    setSoundPermissionStatus('denied');
    console.error('Audio permission issue:', error);
  }
};
