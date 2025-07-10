import React from "react"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {children}
    </div>
  )
}
