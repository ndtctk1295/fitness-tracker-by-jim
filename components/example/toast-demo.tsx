'use client';

import { Button } from "@/components/ui/button";
import { useApiToast } from "@/lib/hooks/use-api-toast";

/**
 * Example component demonstrating the usage of the toast system
 * According to shadcn/ui v3 conventions.
 */
export function ToastDemo() {
  const { 
    showSuccessToast, 
    showErrorToast,
    showInfoToast,
    showWarningToast,
    toast
  } = useApiToast();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-medium">Toast Examples</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Button 
          onClick={() => showSuccessToast('Operation completed', 'Your changes have been saved')}
        >
          Success Toast
        </Button>
        
        <Button 
          variant="destructive" 
          onClick={() => showErrorToast('Operation failed', 'Please try again later')}
        >
          Error Toast
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => showInfoToast('Information', 'Your workout starts in 10 minutes')}
        >
          Info Toast
        </Button>
        
        <Button 
          variant="secondary" 
          onClick={() => showWarningToast('Warning', 'You have not tracked your weight today')}
        >
          Warning Toast
        </Button>
      </div>
      
      <h3 className="text-lg font-medium mt-4">Advanced Usage</h3>
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          onClick={() => 
            toast({
              title: 'Custom Duration',
              description: 'This toast will disappear in 10 seconds',
              duration: 10000,
            })
          }
        >
          Long Duration Toast
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => 
            toast({
              title: 'With Action',
              description: 'Click the button to continue',
              action: (
                <Button size="sm" variant="secondary" onClick={() => alert('Action clicked!')}>
                  Action
                </Button>
              ),
              className: 'bg-slate-50 border-slate-200',
            })
          }
        >
          Toast with Action
        </Button>
      </div>
    </div>
  );
}
