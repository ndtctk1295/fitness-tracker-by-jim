"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Timer } from "lucide-react"
import { formatDistance } from "date-fns"

import { useTimerStore, formatTime } from "@/lib/stores/timer-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function TimerSummary() {
  const { timerStrategies, activeTimer } = useTimerStore()
  const [now, setNow] = useState(Date.now())
    // Refresh component every second when timer is active
  useEffect(() => {
    if (!activeTimer.isActive) return
    
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [activeTimer.isActive])
  
  // No active timer
  if (!activeTimer.isActive) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Timer className="mr-2 h-5 w-5" />
            Workout Timer
          </CardTitle>
          <CardDescription>Track your workout and rest periods</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground">No active timer session</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/timer">Start Timer</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }
  
  // Active timer
  const selectedStrategy = timerStrategies.find(
    (s) => s.id === activeTimer.currentStrategyId
  )
  
  if (!selectedStrategy) {
    return null
  }
  
  const targetDuration = activeTimer.isRest
    ? selectedStrategy.restDuration
    : selectedStrategy.activeDuration
    
  // Calculate percentage complete
  const percentComplete = Math.min(
    100, 
    (activeTimer.elapsedTime / targetDuration) * 100
  )
  
  // Calculate time since timer started
  const timeActive = activeTimer.startTime 
    ? formatDistance(new Date(activeTimer.startTime), new Date(now), { addSuffix: false })
    : "paused"
  
  return (
    <Card>
      <div 
        className="h-2 w-full rounded-t-md" 
        style={{ backgroundColor: selectedStrategy.color }}
      />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center">
            <Timer className="mr-2 h-5 w-5" />
            {selectedStrategy.name}
          </CardTitle>
          <div className="text-xs font-medium px-2 py-1 rounded-md bg-secondary">
            {activeTimer.isRest ? "REST" : "ACTIVE"}
          </div>
        </div>
        <CardDescription>
          {activeTimer.isRest ? "Rest between sets" : "Active workout period"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mb-2">
          <div className="flex justify-between items-center text-sm mb-1">
            <div>
              {formatTime(activeTimer.elapsedTime)} / {formatTime(targetDuration)}
            </div>
            <div className="text-xs text-muted-foreground">
              {activeTimer.isActive ? `Started ${timeActive} ago` : "Paused"}
            </div>
          </div>
          <Progress value={percentComplete} className="h-2" />
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/timer">View Timer</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
