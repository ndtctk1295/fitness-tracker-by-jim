'use client'

import { useState } from 'react'
import { ChevronDown, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface ExerciseFilters {
  difficulty: string[]
  muscleGroups: string[]
  equipment: string[]
  category: string
}

interface ExerciseFiltersProps {
  filters: ExerciseFilters
  onFiltersChange: (filters: ExerciseFilters) => void
  categories: Array<{ id: string; name: string; color: string }>
  onClearFilters: () => void
}

// Static filter options based on the enhanced exercise model
const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

const MUSCLE_GROUP_OPTIONS = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Biceps', 'Triceps', 
  'Forearms', 'Core', 'Abs', 'Legs', 'Quadriceps', 'Hamstrings', 
  'Calves', 'Glutes', 'Full Body', 'Cardio'
]

const EQUIPMENT_OPTIONS = [
  'None (Bodyweight)', 'Dumbbells', 'Barbell', 'Kettlebells', 
  'Resistance Bands', 'Pull-up Bar', 'Bench', 'Cable Machine', 
  'Smith Machine', 'Leg Press', 'Cardio Equipment', 'Medicine Ball', 
  'Stability Ball', 'TRX/Suspension', 'Machines'
]

export function ExerciseFilters({ 
  filters, 
  onFiltersChange, 
  categories, 
  onClearFilters 
}: ExerciseFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof ExerciseFilters, value: string | string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const toggleArrayFilter = (key: 'difficulty' | 'muscleGroups' | 'equipment', value: string) => {
    const currentArray = filters[key]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    updateFilter(key, newArray)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.category && filters.category !== 'all') count++
    count += filters.difficulty.length
    count += filters.muscleGroups.length
    count += filters.equipment.length
    return count
  }

  const hasActiveFilters = getActiveFiltersCount() > 0

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <CardTitle className="text-lg">Filters</CardTitle>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onClearFilters()
                    }}
                    className="h-8 px-2"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </Button>
                )}
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Category</Label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => updateFilter('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Difficulty
                  {filters.difficulty.length > 0 && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {filters.difficulty.length}
                    </Badge>
                  )}
                </Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {DIFFICULTY_OPTIONS.map((difficulty) => (
                    <div key={difficulty} className="flex items-center space-x-2">
                      <Checkbox
                        id={`difficulty-${difficulty}`}
                        checked={filters.difficulty.includes(difficulty)}
                        onCheckedChange={() => toggleArrayFilter('difficulty', difficulty)}
                      />
                      <Label 
                        htmlFor={`difficulty-${difficulty}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {difficulty}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Muscle Groups Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Muscle Groups
                  {filters.muscleGroups.length > 0 && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {filters.muscleGroups.length}
                    </Badge>
                  )}
                </Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {MUSCLE_GROUP_OPTIONS.map((muscleGroup) => (
                    <div key={muscleGroup} className="flex items-center space-x-2">
                      <Checkbox
                        id={`muscle-${muscleGroup}`}
                        checked={filters.muscleGroups.includes(muscleGroup)}
                        onCheckedChange={() => toggleArrayFilter('muscleGroups', muscleGroup)}
                      />
                      <Label 
                        htmlFor={`muscle-${muscleGroup}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {muscleGroup}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Equipment
                  {filters.equipment.length > 0 && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {filters.equipment.length}
                    </Badge>
                  )}
                </Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {EQUIPMENT_OPTIONS.map((equipment) => (
                    <div key={equipment} className="flex items-center space-x-2">
                      <Checkbox
                        id={`equipment-${equipment}`}
                        checked={filters.equipment.includes(equipment)}
                        onCheckedChange={() => toggleArrayFilter('equipment', equipment)}
                      />
                      <Label 
                        htmlFor={`equipment-${equipment}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {equipment}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <Label className="text-sm font-medium">Active Filters:</Label>
                <div className="flex flex-wrap gap-2">
                  {filters.category && filters.category !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {categories.find(c => c.id === filters.category)?.name || 'Category'}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => updateFilter('category', 'all')}
                      />
                    </Badge>
                  )}
                  
                  {filters.difficulty.map((difficulty) => (
                    <Badge key={difficulty} variant="secondary" className="flex items-center gap-1">
                      {difficulty}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => toggleArrayFilter('difficulty', difficulty)}
                      />
                    </Badge>
                  ))}
                  
                  {filters.muscleGroups.map((muscle) => (
                    <Badge key={muscle} variant="secondary" className="flex items-center gap-1">
                      {muscle}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => toggleArrayFilter('muscleGroups', muscle)}
                      />
                    </Badge>
                  ))}
                  
                  {filters.equipment.map((equip) => (
                    <Badge key={equip} variant="secondary" className="flex items-center gap-1">
                      {equip}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => toggleArrayFilter('equipment', equip)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
