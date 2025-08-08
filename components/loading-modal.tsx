"use client"

import React from "react"
import { Loader2, Dumbbell } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingScreenProps {
  title?: string
  description?: string
  variant?: "default" | "minimal" | "branded"
  className?: string
  showProgress?: boolean
}

export function LoadingScreen({
  title = "Loading Fitness Tracker",
  description = "Please wait while we prepare your workout experience...",
  variant = "default",
  className,
  showProgress = false
}: LoadingScreenProps) {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    if (!showProgress) return

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 300)

    return () => clearInterval(timer)
  }, [showProgress])

  if (variant === "minimal") {
    return (
      <div className={cn(
        "fixed inset-0 z-50 bg-background flex items-center justify-center",
        className
      )}>
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
    )
  }

  if (variant === "branded") {
    return (
      <div className={cn(
        "fixed inset-0 z-50 bg-gradient-to-br from-background via-background to-primary/5",
        "flex items-center justify-center",
        className
      )}>
        <div className="flex flex-col items-center space-y-6 text-center max-w-md px-6">
          {/* Brand Icon with Animation */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            <div className="relative bg-primary rounded-full p-4">
              <Dumbbell className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          {/* Brand Name */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Fitness Tracker
            </h1>
            {/* <p className="text-sm text-muted-foreground">
              by Jim
            </p> */}
          </div>

          {/* Loading Animation */}
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>

          {/* Loading Dots */}
          <div className="flex space-x-1">
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm",
      "flex items-center justify-center",
      className
    )}>
      <div className="flex flex-col items-center space-y-6 text-center max-w-sm px-6">
        {/* Main Spinner */}
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-muted animate-pulse" />
        </div>

        {/* Title and Description */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Progress Bar (Optional) */}
        {showProgress && (
          <div className="w-full space-y-2">
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(progress)}% loaded
            </p>
          </div>
        )}

        {/* Loading Animation Dots */}
        <div className="flex space-x-1">
          <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  )
}

// Pre-configured loading screens for different use cases
export const LoadingScreens = {
  // App initialization
  App: () => (
    <LoadingScreen
      title="Loading Fitness Tracker"
      description="Initializing your workout experience..."
      variant="branded"
    />
  ),

  // Route transitions
  Route: () => (
    <LoadingScreen
      title="Loading Page"
      description="Please wait..."
      variant="minimal"
    />
  ),

  // Data loading
  Data: () => (
    <LoadingScreen
      title="Loading Data"
      description="Fetching your fitness data..."
      variant="default"
    />
  ),

  // Authentication
  Auth: () => (
    <LoadingScreen
      title="Authenticating"
      description="Verifying your credentials..."
      variant="default"
    />
  ),

  // With progress
  Progress: () => (
    <LoadingScreen
      title="Setting Up"
      description="Preparing your personalized experience..."
      variant="default"
      showProgress={true}
    />
  ),
}

// Hook for managing loading screen state
export function useLoadingScreen() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [config, setConfig] = React.useState<LoadingScreenProps>({})

  const showLoading = (loadingConfig?: LoadingScreenProps) => {
    setConfig(loadingConfig || {})
    setIsLoading(true)
  }

  const hideLoading = () => {
    setIsLoading(false)
  }

  const LoadingComponent = () => (
    isLoading ? <LoadingScreen {...config} /> : null
  )

  return {
    isLoading,
    showLoading,
    hideLoading,
    LoadingScreen: LoadingComponent
  }
}
