"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExerciseDetailDialog } from "@/components/exercise-detail-dialog"

export default function ExerciseDetailDialogTest() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Exercise Detail Dialog Test</h1>
      
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Test the Exercise Detail Dialog with new nested tabs for favorites and all exercises.
        </p>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Selected Date:</label>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value + 'T12:00:00'))}
            className="block w-48 px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <Button onClick={() => setIsDialogOpen(true)}>
          Open Exercise Detail Dialog
        </Button>
      </div>

      <ExerciseDetailDialog
        date={selectedDate}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  )
}
