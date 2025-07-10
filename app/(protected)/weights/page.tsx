"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WeightPlateModal } from "@/components/weight-plate-modal"
import { useWeightStore, StoreWeightPlate } from "@/lib/stores/weight-store"
import { weightPlateService } from "@/lib/services/weight-plate-service"

export default function WeightsPage() {
  const { weights, deleteWeight, weightUnit, setWeightUnit, setWeights } = useWeightStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingWeight, setEditingWeight] = useState<StoreWeightPlate | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Load weight plates from API
  useEffect(() => {
    const fetchWeightPlates = async () => {
      try {
        setLoading(true)
        const data = await weightPlateService.getAll()
        
        // Convert API model to client store model
        const clientWeights = data.map(plate => ({
          id: plate._id,
          value: plate.value,
          color: plate.color,
          createdAt: plate.createdAt,
          updatedAt: plate.updatedAt
        }))
        
        if (clientWeights.length > 0) {
          // If user has weights in DB, use those
          setWeights(clientWeights)
        }
      } catch (error) {
        console.error('Error fetching weight plates:', error)
        toast.error('Failed to load your weight plates')
      } finally {
        setLoading(false)
      }
    }

    fetchWeightPlates()
  }, [setWeights])

  const handleAddNew = () => {
    setEditingWeight(null)
    setModalOpen(true)
  }

  const handleEdit = (weight: StoreWeightPlate) => {
    setEditingWeight(weight)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this weight?")) {
      try {
        setSubmitting(true)
        
        // Delete from server
        await weightPlateService.delete(id)
        
        // Delete from local store
        deleteWeight(id)
        
        toast.success('Weight plate deleted successfully')
      } catch (error) {
        console.error('Error deleting weight plate:', error)
        toast.error('Failed to delete weight plate')
      } finally {
        setSubmitting(false)
      }
    }
  }

  return (
    <div className="py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="weight-unit">Weight Unit</Label>
          <Select value={weightUnit} onValueChange={(value: "kg" | "lbs") => setWeightUnit(value)}>
            <SelectTrigger id="weight-unit" className="w-24">
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="lbs">lbs</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleAddNew}
          disabled={submitting}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Weight Plate
        </Button>
      </div>

      <WeightPlateModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editingWeight={editingWeight}
      />

      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading your weight plates...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {weights.length === 0 ? (
            <Card>
              <CardContent className="flex justify-center items-center p-8">
                <p>No weight plates found. Add some to get started.</p>
              </CardContent>
            </Card>
          ) : (
            weights.map((weight) => (
              <Card key={weight.id} className="overflow-hidden">
                <div className="h-2" style={{ backgroundColor: weight.color }} />
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-16 rounded-sm flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: weight.color }}
                      >
                        {weight.value}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">
                          {weight.value} {weightUnit}
                        </h3>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(weight)}
                        disabled={submitting}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(weight.id)}
                        disabled={submitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
