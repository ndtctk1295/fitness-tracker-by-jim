"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"

import { DataTableFacetedFilter } from "./data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  categories?: Array<{ label: string; value: string; color: string }>
}

export function DataTableToolbar<TData>({
  table,
  categories = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const statuses = [
    {
      label: "Completed",
      value: true,
    },
    {
      label: "Pending", 
      value: false,
    },
  ]

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col sm:flex-row sm:flex-1 sm:items-center sm:space-x-2 space-y-2 sm:space-y-0 w-full">
        <Input
          placeholder="Filter exercises..."
          value={(table.getColumn("exerciseName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("exerciseName")?.setFilterValue(event.target.value)
          }
          className="h-8 w-full lg:w-[250px]"
        />
        <div className="flex items-center space-x-2">
          {table.getColumn("completed") && (
            <DataTableFacetedFilter
              column={table.getColumn("completed")}
              title="Status"
              options={statuses}
            />
          )}
          {table.getColumn("categoryName") && categories.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn("categoryName")}
              title="Category"
              options={categories.map(cat => ({
                label: cat.label,
                value: cat.value,
              }))}
            />
          )}
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
