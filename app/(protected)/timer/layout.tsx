import React from "react"


export default function TimerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold">Timer Strategies</h1>
      {children}
    </div>
  )
}
