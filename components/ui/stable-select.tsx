'use client';

import * as React from 'react';
import { Select } from '@/components/ui/select-stable';

interface StableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

/**
 * A stable select component that prevents unnecessary re-renders
 * by using useRef to store the latest callback
 */
export const StableSelect = React.memo(
  ({ value, onValueChange, children }: StableSelectProps) => {
    // Create a ref to store the latest value/callback without triggering re-renders
    const valueRef = React.useRef(value);
    const callbackRef = React.useRef(onValueChange);
    
    // Update refs when props change
    React.useEffect(() => {
      valueRef.current = value;
      callbackRef.current = onValueChange;
    }, [value, onValueChange]);
    
    // Create a truly stable callback that never changes
    const handleChange = React.useCallback((newValue: string) => {
      if (newValue !== valueRef.current) {
        callbackRef.current(newValue);
      }
    }, []);
    
    return (
      <Select value={value} onValueChange={handleChange}>
        {children}
      </Select>
    );
  },
  // Custom comparison to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Only re-render if value actually changed
    return prevProps.value === nextProps.value;
  }
);

StableSelect.displayName = 'StableSelect';
