"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

// Create a memoized version of the ScrollBar component to prevent unnecessary renders
const MemoScrollBar = React.memo(React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => {
  // Memoize the className to prevent unnecessary re-renders
  const scrollbarClassName = React.useMemo(() => {
    return cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 border-t border-t-transparent p-[1px]",
      className,
    )
  }, [orientation, className]);
  
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={scrollbarClassName}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}));
MemoScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

// Create a memoized version of the ScrollArea component
const StableScrollArea = React.memo(React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => {
  // Memoize the className to prevent unnecessary re-renders
  const rootClassName = React.useMemo(() => {
    return cn("relative overflow-hidden", className);
  }, [className]);
  
  // Use useRef to keep track of the component's mounted state
  // This helps prevent potential infinite update loops
  const isMounted = React.useRef(false);
  
  // Use effect to track the mounted state and clean up
  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return (
    <ScrollAreaPrimitive.Root 
      ref={ref} 
      className={rootClassName} 
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <MemoScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}));
StableScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

export { StableScrollArea as ScrollArea, MemoScrollBar as ScrollBar }
