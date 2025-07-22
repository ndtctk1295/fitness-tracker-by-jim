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

// Static filter options based on the actual exercise data
const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]

const MUSCLE_GROUP_OPTIONS = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'arms', label: 'Arms' },
  { value: 'biceps', label: 'Biceps' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'core', label: 'Core' },
  { value: 'quadriceps', label: 'Quadriceps' },
  { value: 'hamstrings', label: 'Hamstrings' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'calves', label: 'Calves' },
  { value: 'legs', label: 'Legs' },
  { value: 'lats', label: 'Lats' },
  { value: 'rhomboids', label: 'Rhomboids' },
  { value: 'upper back', label: 'Upper Back' },
  { value: 'middle back', label: 'Middle Back' },
  { value: 'lower back', label: 'Lower Back' }
]

const EQUIPMENT_OPTIONS = [
  { value: '', label: 'Bodyweight (No Equipment)' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'dumbbell', label: 'Dumbbell' },
  { value: 'bench', label: 'Bench' },
  { value: 'pull‑up bar', label: 'Pull-up Bar' },
  { value: 'dip bars', label: 'Dip Bars' },
  { value: 'leg press machine', label: 'Leg Press Machine' },
  { value: 'lat pulldown machine', label: 'Lat Pulldown Machine' },
  { value: 'seated row machine', label: 'Seated Row Machine' },
  { value: 'hyperextension bench', label: 'Hyperextension Bench' },
  { value: 'running shoes', label: 'Running Shoes' },
  { value: 'stationary bike or road bike', label: 'Bike' },
  { value: 'jump rope', label: 'Jump Rope' },
  { value: 'rowing machine', label: 'Rowing Machine' },
  { value: 'elliptical machine', label: 'Elliptical Machine' },
  { value: 'stair climber', label: 'Stair Climber' },
  { value: 'plyo box', label: 'Plyo Box' }
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
                    <div key={difficulty.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`difficulty-${difficulty.value}`}
                        checked={filters.difficulty.includes(difficulty.value)}
                        onCheckedChange={() => toggleArrayFilter('difficulty', difficulty.value)}
                      />
                      <Label 
                        htmlFor={`difficulty-${difficulty.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {difficulty.label}
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
                    <div key={muscleGroup.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`muscle-${muscleGroup.value}`}
                        checked={filters.muscleGroups.includes(muscleGroup.value)}
                        onCheckedChange={() => toggleArrayFilter('muscleGroups', muscleGroup.value)}
                      />
                      <Label 
                        htmlFor={`muscle-${muscleGroup.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {muscleGroup.label}
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
                    <div key={equipment.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`equipment-${equipment.value}`}
                        checked={filters.equipment.includes(equipment.value)}
                        onCheckedChange={() => toggleArrayFilter('equipment', equipment.value)}
                      />
                      <Label 
                        htmlFor={`equipment-${equipment.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {equipment.label}
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
                  
                  {filters.difficulty.map((difficulty) => {
                    const difficultyOption = DIFFICULTY_OPTIONS.find(opt => opt.value === difficulty);
                    return (
                      <Badge key={difficulty} variant="secondary" className="flex items-center gap-1">
                        {difficultyOption?.label || difficulty}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => toggleArrayFilter('difficulty', difficulty)}
                        />
                      </Badge>
                    );
                  })}
                  
                  {filters.muscleGroups.map((muscle) => {
                    const muscleOption = MUSCLE_GROUP_OPTIONS.find(opt => opt.value === muscle);
                    return (
                      <Badge key={muscle} variant="secondary" className="flex items-center gap-1">
                        {muscleOption?.label || muscle}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => toggleArrayFilter('muscleGroups', muscle)}
                        />
                      </Badge>
                    );
                  })}
                  
                  {filters.equipment.map((equip) => {
                    const equipmentOption = EQUIPMENT_OPTIONS.find(opt => opt.value === equip);
                    return (
                      <Badge key={equip} variant="secondary" className="flex items-center gap-1">
                        {equipmentOption?.label || equip || 'Bodyweight'}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => toggleArrayFilter('equipment', equip)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
