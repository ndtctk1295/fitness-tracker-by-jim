'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useExerciseStore } from '@/lib/stores/exercise-store'

export default function CategoriesPage() {
  const { categories } = useExerciseStore()
  
  return (
    <div className="py-10">
      <h1 className="text-3xl font-bold mb-6">Exercise Categories</h1>
      <p className="text-muted-foreground mb-8">
        Browse the categories used to organize your exercises.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <div className="h-2" style={{ backgroundColor: category.color }} />
            <CardContent className="pt-6">
              <div>
                <h3 className="font-medium text-lg">{category.name}</h3>
                <span 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1"
                  style={{ backgroundColor: category.color, color: '#fff' }}
                >
                  Color: {category.color}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
