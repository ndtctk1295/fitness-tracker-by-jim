import React from "react"


export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      {children}
    </div>
  )
}
