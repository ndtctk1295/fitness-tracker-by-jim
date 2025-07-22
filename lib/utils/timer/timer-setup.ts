import { TimerStrategy, timerStrategyService } from '@/lib/services/clients-service/timer-strategy-service';
import { checkAudioPermission } from '@/lib/utils/timer';

/**
 * Timer setup and initialization utilities
 */

/**
 * Fetch timer strategies from API
 */
export const fetchTimerStrategies = async (
  setTimerStrategies: React.Dispatch<React.SetStateAction<TimerStrategy[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedStrategyId: React.Dispatch<React.SetStateAction<string>>,
  selectedStrategyId: string,
  toast: any
) => {
  try {
    setIsLoading(true);
    const strategies = await timerStrategyService.getAll();
    setTimerStrategies(strategies);
    
    // Set default strategy when data loads
    if (strategies.length > 0 && !selectedStrategyId) {
      setSelectedStrategyId(strategies[0]._id);
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to load timer strategies",
      variant: "destructive"
    });
    console.error("Error fetching timer strategies:", error);
  } finally {
    setIsLoading(false);
  }
};

/**
 * Setup audio permissions
 */
export const setupAudioPermissions = (
  setSoundPermissionStatus: React.Dispatch<React.SetStateAction<string>>
) => {
  checkAudioPermission(setSoundPermissionStatus);
};

/**
 * Create drag and drop sensors configuration
 */
export const createDragSensors = (
  useSensors: any,
  useSensor: any,
  PointerSensor: any,
  MouseSensor: any,
  TouchSensor: any
) => {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );
};

/**
 * Handle drag end for exercise reordering
 */
export const handleDragEnd = (
  event: any,
  setOrderedExerciseIds: React.Dispatch<React.SetStateAction<string[]>>,
  toast: any
) => {
  const { active, over } = event;
  
  if (!over || active.id === over.id) {
    return;
  }
  
  // Update the order by creating a new array
  setOrderedExerciseIds(currentIds => {
    // Find the indices of the items being reordered
    const oldIndex = currentIds.findIndex(id => id === active.id);
    const newIndex = currentIds.findIndex(id => id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) {
      console.error("Could not find exercise indices", { oldIndex, newIndex });
      return currentIds; // Return unchanged if indices not found
    }
    
    // Create a new array with the updated order
    const newOrderedIds = [...currentIds];
    const [movedId] = newOrderedIds.splice(oldIndex, 1);
    newOrderedIds.splice(newIndex, 0, movedId);
    
    return newOrderedIds;
  });
  
  // Show toast notification for good UX
  toast({
    title: "Order updated",
    description: "Exercise order has been updated",
  });
};
