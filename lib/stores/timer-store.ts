"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { StoreTimerStrategy } from '@/lib/types'

interface ActiveTimer {
  isActive: boolean
  isRest: boolean  // true for rest timer, false for active timer
  startTime: number | null
  currentStrategyId: string | null
  scheduledDate: string | null // to keep track of which day's exercises to show
  elapsedTime: number // in seconds
}

interface TimerStore {
  timerStrategies: StoreTimerStrategy[]
  activeTimer: ActiveTimer
  
  // Timer Strategy actions
  addTimerStrategy: (strategy: StoreTimerStrategy) => void
  updateTimerStrategy: (id: string, data: Partial<Omit<StoreTimerStrategy, "id">>) => void
  deleteTimerStrategy: (id: string) => void
  
  // Timer state actions
  startTimer: (strategyId: string, isRest: boolean, scheduledDate: string) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  switchTimerType: () => void
  updateElapsedTime: (time: number) => void
}

// Sample data
const sampleTimerStrategies: StoreTimerStrategy[] = [
  {
    id: "1",
    name: "Standard Workout",
    color: "#f59e0b",
    restDuration: 90, // 1.5 minutes
    activeDuration: 60, // 1 minute
    cycles: 5,
    breakDuration: 180,
  },
  {
    id: "2",
    name: "High Intensity",
    color: "#ef4444",
    restDuration: 30, // 30 seconds
    activeDuration: 45, // 45 seconds
    cycles: 8,
    breakDuration: 300,
  },
  {
    id: "3",
    name: "Endurance",
    color: "#3b82f6",
    restDuration: 60, // 1 minute
    activeDuration: 180, // 3 minutes
    cycles: 3,
    breakDuration: 240,
  },
]

const initialActiveTimer: ActiveTimer = {
  isActive: false,
  isRest: true,
  startTime: null,
  currentStrategyId: null,
  scheduledDate: null,
  elapsedTime: 0,
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set) => ({
      timerStrategies: sampleTimerStrategies,
      activeTimer: initialActiveTimer,
      
      // Timer Strategy actions
      addTimerStrategy: (strategy) => 
        set((state) => ({ timerStrategies: [...state.timerStrategies, strategy] })),
      
      updateTimerStrategy: (id, data) =>
        set((state) => ({
          timerStrategies: state.timerStrategies.map((strategy) => 
            strategy.id === id ? { ...strategy, ...data } : strategy
          ),
        })),
      
      deleteTimerStrategy: (id) =>
        set((state) => ({
          timerStrategies: state.timerStrategies.filter((strategy) => strategy.id !== id),
        })),
        // Timer state actions
      startTimer: (strategyId, isRest, scheduledDate) =>
        set((state) => ({
          activeTimer: {
            isActive: true,
            isRest,
            startTime: Date.now(),
            currentStrategyId: strategyId,
            scheduledDate,
            elapsedTime: 0,
          },
        })),
      
      pauseTimer: () =>
        set((state) => ({
          activeTimer: {
            ...state.activeTimer,
            isActive: false,
            startTime: null,
          },
        })),
      
      resumeTimer: () =>
        set((state) => ({
          activeTimer: {
            ...state.activeTimer,
            isActive: true,
            startTime: Date.now(),
          },
        })),
      
      stopTimer: () =>
        set(() => ({
          activeTimer: initialActiveTimer,
        })),
      
      switchTimerType: () =>
        set((state) => ({
          activeTimer: {
            ...state.activeTimer,
            isRest: !state.activeTimer.isRest,
            startTime: Date.now(),
            elapsedTime: 0,
          },
        })),
      
      updateElapsedTime: (time) =>
        set((state) => ({
          activeTimer: {
            ...state.activeTimer,
            elapsedTime: time,
          },
        })),
    }),
    {
      name: "fitness-timer-storage",
    }
  )
)

// Utility function to format seconds into MM:SS
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
