'use client'

import { useState, useEffect } from 'react'
import { Plus, Save, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWeightStore, StoreWeightPlate } from '@/lib/stores/weight-store'
import { weightPlateService } from '@/lib/services/weight-plate-service'

interface WeightPlateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingWeight?: StoreWeightPlate | null
}

export function WeightPlateModal({ open, onOpenChange, editingWeight }: WeightPlateModalProps) {
  const { addWeight, updateWeight, weightUnit } = useWeightStore()
  
  const [value, setValue] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [submitting, setSubmitting] = useState(false)

  // Reset form when modal opens/closes or editing weight changes
  useEffect(() => {
    if (open) {
      if (editingWeight) {
        setValue(editingWeight.value.toString())
        setColor(editingWeight.color)
      } else {
        setValue('')
        setColor('#3b82f6')
      }
    }
  }, [open, editingWeight])

  const resetForm = () => {
    setValue('')
    setColor('#3b82f6')
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (!value) {
      toast.error('Please enter a weight value')
      return
    }

    try {
      setSubmitting(true)
      
      if (editingWeight) {
        // Update existing weight plate
        const apiWeight = await weightPlateService.update(editingWeight.id, {
          value: Number.parseFloat(value),
          color: color,
        })
        
        // Update local store
        updateWeight(editingWeight.id, {
          value: apiWeight.value,
          color: apiWeight.color,
        })
        
        toast.success('Weight plate updated successfully')
      } else {
        // Create new weight plate
        const apiWeight = await weightPlateService.create({
          value: Number.parseFloat(value),
          color: color,
        })
        
        // Update local store
        addWeight({
          id: apiWeight._id,
          value: apiWeight.value,
          color: apiWeight.color,
          createdAt: apiWeight.createdAt,
          updatedAt: apiWeight.updatedAt,
        })
        
        toast.success('Weight plate added successfully')
      }
      
      resetForm()
    } catch (error) {
      console.error('Error saving weight plate:', error)
      toast.error(`Failed to ${editingWeight ? 'update' : 'add'} weight plate`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingWeight ? 'Edit Weight Plate' : 'Add Weight Plate'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weight-value">Value ({weightUnit})</Label>
            <Input
              id="weight-value"
              type="number"
              step="0.25"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Weight in ${weightUnit}`}
              disabled={submitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight-color">Color</Label>
            <div className="flex gap-2">
              <Input
                id="weight-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 p-1 h-10"
                disabled={submitting}
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1"
                disabled={submitting}
                placeholder="#3b82f6"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={resetForm} disabled={submitting}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : editingWeight ? (
              <Save className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {editingWeight ? 'Update Weight Plate' : 'Add Weight Plate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
