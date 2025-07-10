import React from "react"

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Exercise History</h1>
        <p className="text-muted-foreground">
          View and analyze all your planned and completed exercises
        </p>
      </div>
      {children}
    </div>
  )
}
