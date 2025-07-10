"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EnrichedScheduledExercise } from "./types"
import { DataTableColumnHeader } from "./data-table-column-header"
import { ExerciseCompletionToggle } from "@/components/ui/exercise-completion-toggle"
import { MoreHorizontal, Edit, Trash, CheckCircle } from "lucide-react"

interface CreateColumnsProps {
  markExerciseCompleted: (id: string) => Promise<void>
}

export const createColumns = ({ markExerciseCompleted }: CreateColumnsProps): ColumnDef<EnrichedScheduledExercise>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"))
      return (
        <div className="font-medium">
          {date.toLocaleDateString()}
        </div>
      )
    },
  },
  {
    accessorKey: "exerciseName", 
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Exercise" />
    ),
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px] truncate font-medium">
          {row.getValue("exerciseName")}
        </div>
      )
    },
  },
  {
    accessorKey: "categoryName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const categoryColor = row.original.categoryColor
      return (
        <Badge 
          variant="outline" 
          className="font-medium"
          style={{ 
            borderColor: categoryColor, 
            color: categoryColor 
          }}
        >
          {row.getValue("categoryName")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "sets",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sets" />
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("sets")}</div>
    },
  },
  {
    accessorKey: "reps", 
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reps" />
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("reps")}</div>
    },
  },
  {
    accessorKey: "weight",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Weight" />
    ),
    cell: ({ row }) => {
      const weight = parseFloat(row.getValue("weight"))
      return (
        <div className="text-center font-medium">
          {weight}kg
        </div>
      )
    },
  },  {
    accessorKey: "completed",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const exercise = row.original
      return (
        <ExerciseCompletionToggle 
          exerciseId={exercise.id}
          completed={exercise.completed}
          completedAt={exercise.completedAt}
          variant="badge"
          size="sm"
        />
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string
      return (
        <div className="max-w-[150px] truncate text-muted-foreground">
          {notes || "-"}
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const exercise = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(exercise.id)}
            >
              Copy exercise ID
            </DropdownMenuItem>
            {!exercise.completed && (
              <DropdownMenuItem
                onClick={() => markExerciseCompleted(exercise.id)}
                className="text-green-600"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Set to Complete
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit exercise
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete exercise
            </DropdownMenuItem>
          </DropdownMenuContent>        </DropdownMenu>
      )
    },
  },
]

// Keep the original columns export for backward compatibility
export const columns = createColumns({ 
  markExerciseCompleted: async () => console.warn('markExerciseCompleted not provided') 
})
