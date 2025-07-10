import React from "react"


export default function ExercisesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold">Exercises</h1>
      {children}
    </div>
  )
}
