"use client"

import { useEffect, useRef, useState } from "react"

// Audio file sources in order of preference
const AUDIO_SOURCES = [
  "/sounds/timer-complete.mp3",
  "/sounds/timer-complete.wav",
  "/sounds/timer-beep.wav"
]

// Base64-encoded tiny WAV file as ultimate fallback (minimal beep sound)
const FALLBACK_SOUND_DATA_URL = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBhxQovfFjjcAAChR4ODBgCoAACFI0dm0cBoAABg9yNuqZBQAABExx9ekaRkAABAsx9eqdh8AABUux9msficAABwmwtWqgjIAACAjus+hckAAAB8ptMWMVgkAABw2wr2FUAcAABZBzLaBTQkAABBH1a9/SxEAAAxJ16yASxcAAAo6xLZMvpBdK0YLAA=="

// Check if Web Audio API is available
const isWebAudioSupported = typeof window !== "undefined" && "AudioContext" in window;

// Function to check if audio format is supported
const canPlayType = (type: string): boolean => {
  if (typeof window === "undefined") return false
  
  const audio = document.createElement("audio")
  
  // Map file extensions to MIME types
  const mimeTypes: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg'
  }
  
  // Get the file extension
  const ext = type.substring(type.lastIndexOf('.'))
  const mimeType = mimeTypes[ext]
  
  return !!mimeType && audio.canPlayType(mimeType) !== ""
}

export const useTimerSound = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const [soundPermissionStatus, setSoundPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  
  // Generate a beep using Web Audio API as fallback
  const generateBeep = () => {
    if (!isWebAudioSupported || !isSoundEnabled) return;
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Configure oscillator
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz beep
      
      // Configure gain (volume)
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Start & stop
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Auto-close context
      setTimeout(() => {
        if (audioContext.state !== 'closed') {
          audioContext.close().catch((e) => console.error("Error closing AudioContext:", e));
        }
      }, 1000);
    } catch (e) {
      console.error("Web Audio API beep failed:", e);
    }
  };

  // Create audio elements when the component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Try each audio source until one works
      let loaded = false;
      
      // Function to try loading an audio source
      const tryLoadAudio = (sourceIndex = 0) => {
        if (sourceIndex >= AUDIO_SOURCES.length) {
          console.warn("No compatible audio format found, trying base64 fallback");
          // Try base64 data URL as ultimate fallback
          tryBase64Fallback();
          return;
        }
        
        const source = AUDIO_SOURCES[sourceIndex];
        
        // Check if format is supported first
        if (!canPlayType(source)) {
          console.log(`Format not supported for ${source}, trying next...`);
          tryLoadAudio(sourceIndex + 1);
          return;
        }
        
        // Try to load the audio
        const audio = new Audio(source);
        
        // Handle successful loading
        audio.addEventListener('canplaythrough', () => {
          if (!loaded) {
            loaded = true;
            audioRef.current = audio;
            setAudioLoaded(true);
            console.log(`Successfully loaded audio: ${source}`);
          }
        });
        
        // Handle loading errors
        audio.addEventListener('error', (e) => {
          console.warn(`Error loading audio ${source}:`, e);
          tryLoadAudio(sourceIndex + 1);
        });
        
        // Start loading
        audio.load();
        
        // Try to play a silent version to prompt autoplay
        setTimeout(() => {
          const originalVolume = audio.volume;
          audio.volume = 0;
          audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = originalVolume;
            setSoundPermissionStatus('granted'); // Explicitly set to granted on successful silent play
          }).catch((e) => {
            console.log("Silent play failed (expected):", e);
            audio.volume = originalVolume;
            if (e.name === 'NotAllowedError') {
              setSoundPermissionStatus('denied');
            } else {
              // If it's not a NotAllowedError, it might be something else, keep as unknown or handle differently
              // For now, we'll assume other errors don't definitively mean permission is denied forever.
            }
          });
        }, 1000);
      };
      
      // Try base64-encoded WAV as final fallback
      const tryBase64Fallback = () => {
        try {
          console.log("Trying base64-encoded WAV fallback");
          const audio = new Audio(FALLBACK_SOUND_DATA_URL);
          
          audio.addEventListener('canplaythrough', () => {
            if (!loaded) {
              loaded = true;
              audioRef.current = audio;
              setAudioLoaded(true);
              console.log('Successfully loaded base64 audio fallback');
            }
          });
          
          audio.addEventListener('error', (e) => {
            console.warn("Error loading base64 audio:", e);
            // We've tried everything, give up
            console.error("All audio options failed, will fall back to Web Audio API");
          });
          
          audio.load();
        } catch (e) {
          console.error("Failed to load base64 audio fallback:", e);
        }
      };
      
      // Start trying to load audio
      tryLoadAudio();
    }

    return () => {
      // Clean up audio when component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playTimerCompleteSound = () => {
    if (!isSoundEnabled) return;
    
    // Try to play audio file if available
    if (audioRef.current) {
      // Reset to start
      audioRef.current.currentTime = 0;
      
      // Play with better error handling
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Audio is playing successfully
            setSoundPermissionStatus('granted');
          })
          .catch((error) => {
            console.error("Error playing sound:", error);
            
            // Try to handle autoplay policy issues
            if (error.name === 'NotAllowedError') {
              console.info('Audio playback was not allowed. This may be due to browser autoplay policies.');
              setSoundPermissionStatus('denied');
            }
            
            // Try fallback with Web Audio API beep
            generateBeep();
          });
      }
    } else {
      // No audio ref, use Web Audio API fallback
      generateBeep();
    }
  };

  // Function to check if audio can be played (useful for debugging)
  const testSound = () => {
    return new Promise<boolean>((resolve) => {
      if (isSoundEnabled && audioRef.current && audioLoaded) {
        const originalVolume = audioRef.current.volume;
        // Set to a very low volume for testing
        audioRef.current.volume = 0.1;
        
        // Play with timeout to prevent hanging
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Stop after a moment
              setTimeout(() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.volume = originalVolume;
                  audioRef.current.currentTime = 0;
                }
                setSoundPermissionStatus('granted');
                resolve(true);
              }, 300);
            })
            .catch((error) => {
              console.error("Test sound failed:", error);
              if (audioRef.current) audioRef.current.volume = originalVolume;
              if (error.name === 'NotAllowedError') {
                setSoundPermissionStatus('denied');
              }
              resolve(false);
            });
        } else {
          resolve(false);
        }
      } else if (isWebAudioSupported && isSoundEnabled) {
        // Try Web Audio API test
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const testContext = new AudioContext();
          
          // If we can create context, assume it might work
          testContext.close().then(() => {
            resolve(true);
          }).catch(() => {
            resolve(false);
          });
        } catch (e) {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  };

  return {
    isSoundEnabled,
    setIsSoundEnabled,
    playTimerCompleteSound,
    testSound,
    audioLoaded,
    generateBeep,
    soundPermissionStatus
  };
}
