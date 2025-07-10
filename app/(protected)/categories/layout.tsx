import React from "react"


export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold">Categories</h1>
      {children}
    </div>
  )
}
