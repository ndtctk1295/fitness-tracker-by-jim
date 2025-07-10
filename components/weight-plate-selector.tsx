"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Minus } from "lucide-react"

import { Button } from "@/components/ui/button"

interface WeightPlateProps {
  weight: string
  count: number
  unit: string
  onIncrement: () => void
  onDecrement: () => void
  color: string
}

function WeightPlate({ weight, count, unit, onIncrement, onDecrement, color }: WeightPlateProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={onDecrement} disabled={count === 0}>
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center font-medium">{count}</span>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={onIncrement}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div
        className="mt-2 h-16 w-8 rounded-sm flex items-center justify-center text-white font-bold text-xs"
        style={{ backgroundColor: color }}
      >
        {weight}
      </div>
      <div className="mt-1 text-xs text-center">
        {weight}
        {unit}
      </div>
    </div>
  )
}

interface WeightPlateSelectorProps {
  value: Record<string, number>
  onChange: (value: Record<string, number>) => void
  weights: Array<{ id: string; value: number; color: string }>
  unit: "kg" | "lbs"
}

export function WeightPlateSelector({ value, onChange, weights, unit }: WeightPlateSelectorProps) {
  // Initialize plates with default values
  const [plates, setPlates] = useState<Record<string, number>>({})

  // Use a ref to track if we've initialized the component
  const initializedRef = useRef(false);
  
  // Initialize plates when component mounts or unit/weights changes
  useEffect(() => {
    // Only update plates if needed
    if (!initializedRef.current) {
      const initialPlates: Record<string, number> = {}

      // Initialize with existing values or 0
      weights.forEach((plate) => {
        const plateValue = plate.value.toString()
        initialPlates[plateValue] = value[plateValue] || 0
      })

      setPlates(initialPlates)
      initializedRef.current = true
      // Don't call onChange here to avoid update loops
    } else if (Object.keys(value).length > 0) {
      // Only update if different to avoid loops
      const needsUpdate = JSON.stringify(plates) !== JSON.stringify(value);
      if (needsUpdate) {
        setPlates(value)
      }
    }
  }, [unit, weights, value])

  const handleIncrement = (weight: string) => {
    const newPlates = { ...plates, [weight]: (plates[weight] || 0) + 1 }
    setPlates(newPlates)
    onChange(newPlates)
  }

  const handleDecrement = (weight: string) => {
    if (plates[weight] > 0) {
      const newPlates = { ...plates, [weight]: plates[weight] - 1 }
      setPlates(newPlates)
      onChange(newPlates)
    }
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex flex-wrap gap-6 justify-center">
        {weights.map((weight) => (
          <WeightPlate
            key={weight.id}
            weight={weight.value.toString()}
            count={plates[weight.value.toString()] || 0}
            unit={unit}
            color={weight.color}
            onIncrement={() => handleIncrement(weight.value.toString())}
            onDecrement={() => handleDecrement(weight.value.toString())}
          />
        ))}
      </div>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        Select the weight plates you're using for this exercise
      </div>
    </div>
  )
}
