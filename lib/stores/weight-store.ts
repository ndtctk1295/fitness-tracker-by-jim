'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WeightPlate, StoreWeightPlate } from '@/lib/types'

// Re-export types for external consumption
export type { WeightPlate, StoreWeightPlate } from '@/lib/types';

interface WeightStore {
  weights: StoreWeightPlate[]
  weightUnit: "kg" | "lbs"

  // Weight plate actions
  addWeight: (weight: StoreWeightPlate) => void
  updateWeight: (id: string, data: Partial<Omit<StoreWeightPlate, "id">>) => void
  deleteWeight: (id: string) => void
  setWeights: (weights: StoreWeightPlate[]) => void

  // Settings
  setWeightUnit: (unit: "kg" | "lbs") => void
}

// Default weight plates
const defaultKgWeights: StoreWeightPlate[] = [
  { id: "kg-1", value: 1.25, color: "#94a3b8", unit: "kg", quantity: 4 },
  { id: "kg-2", value: 2.5, color: "#60a5fa", unit: "kg", quantity: 4 },
  { id: "kg-3", value: 5, color: "#34d399", unit: "kg", quantity: 4 },
  { id: "kg-4", value: 10, color: "#fbbf24", unit: "kg", quantity: 4 },
  { id: "kg-5", value: 15, color: "#f87171", unit: "kg", quantity: 4 },
  { id: "kg-6", value: 20, color: "#f43f5e", unit: "kg", quantity: 4 },
  { id: "kg-7", value: 25, color: "#8b5cf6", unit: "kg", quantity: 4 },
]

const defaultLbsWeights: StoreWeightPlate[] = [
  { id: "lbs-1", value: 2.5, color: "#94a3b8", unit: "lbs", quantity: 4 },
  { id: "lbs-2", value: 5, color: "#60a5fa", unit: "lbs", quantity: 4 },
  { id: "lbs-3", value: 10, color: "#34d399", unit: "lbs", quantity: 4 },
  { id: "lbs-4", value: 25, color: "#fbbf24", unit: "lbs", quantity: 4 },
  { id: "lbs-5", value: 35, color: "#f87171", unit: "lbs", quantity: 4 },
  { id: "lbs-6", value: 45, color: "#f43f5e", unit: "lbs", quantity: 4 },
]

export const useWeightStore = create<WeightStore>()(
  persist(
    (set) => ({
      weights: defaultKgWeights,
      weightUnit: "kg",

      // Weight plate actions
      addWeight: (weight) =>
        set((state) => ({
          weights: [...state.weights, weight],
        })),

      updateWeight: (id, data) =>
        set((state) => ({
          weights: state.weights.map((weight) => (weight.id === id ? { ...weight, ...data } : weight)),
        })),

      deleteWeight: (id) =>
        set((state) => ({
          weights: state.weights.filter((weight) => weight.id !== id),
        })),
        
      setWeights: (weights) =>
        set(() => ({
          weights,
        })),

      // Settings
      setWeightUnit: (unit) =>
        set((state) => {
          // When changing units, load the default weights for that unit if none exist
          const weights = unit === "kg" ? defaultKgWeights : defaultLbsWeights
          return {
            weightUnit: unit,
            weights,
          }
        }),
    }),
    {
      name: "fitness-tracker-weights-storage",
    },
  ),
)
