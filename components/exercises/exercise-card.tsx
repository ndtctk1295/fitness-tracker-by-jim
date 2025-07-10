'use client';

import { useState } from 'react';
import { Heart, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUserExercisePreferenceStore } from '@/lib/stores/user-exercise-preference-store';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    categoryId: string;
    description?: string;
    imageUrl?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    muscleGroups?: string[];
    equipment?: string[];
    instructions?: string[];
    tips?: string[];
    isActive?: boolean;
    userStatus?: 'favorite' | null;
    userNotes?: string;
    userCustomSettings?: {
      sets?: number;
      reps?: number;
      weight?: number;
      restTime?: number;
      duration?: number;
    };
    lastUsed?: string;
  };
  onStart?: (exerciseId: string) => void;
  onViewDetails?: (exerciseId: string) => void;
  className?: string;
  compact?: boolean;
}

export function ExerciseCard({ 
  exercise, 
  onStart, 
  onViewDetails, 
  className, 
  compact = false 
}: ExerciseCardProps) {  const [isLoading, setIsLoading] = useState(false);
  const {
    toggleFavorite,
    getPreferenceByExerciseId,
  } = useUserExercisePreferenceStore();

  const userPreference = getPreferenceByExerciseId(exercise.id);
  const isFavorite = userPreference?.status === 'favorite';

  const handleToggleFavorite = async () => {
    setIsLoading(true);
    try {
      await toggleFavorite(exercise.id);
    } catch (error) {
      console.error('Failed to update exercise favorite status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusIcon = (status?: string | null) => {
    switch (status) {
      case 'favorite': return <Heart className="h-4 w-4 text-red-600 fill-current" />;
      default: return null;
    }
  };

  const formatLastUsed = (lastUsed?: string) => {
    if (!lastUsed) return null;
    
    try {
      const date = new Date(lastUsed);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 48) return 'Yesterday';
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      
      return date.toLocaleDateString();
    } catch {
      return null;
    }
  };

  const lastUsedText = formatLastUsed(exercise.lastUsed || userPreference?.lastUsed);
  if (compact) {
    return (
      <Card className={cn("hover:shadow-md transition-shadow cursor-pointer", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                {getStatusIcon(exercise.userStatus || userPreference?.status)}
                <h3 className="font-medium text-sm truncate">{exercise.name}</h3>
              </div>
              {exercise.difficulty && (
                <Badge className={cn("text-xs mt-1", getDifficultyColor(exercise.difficulty))}>
                  {exercise.difficulty}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {lastUsedText && (
                <span className="text-xs text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {lastUsedText}
                </span>
              )}
              <Button 
                size="sm" 
                variant={isFavorite ? "default" : "outline"}
                onClick={handleToggleFavorite}
                disabled={isLoading}
              >
                <Heart className={cn("h-3 w-3", isFavorite && "fill-current")} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("hover:shadow-lg transition-all duration-200 group", className)}>
      <CardContent className="p-6">        {/* Header with status and actions */}
        <div className="flex items-start justify-between mb-4 w-full">
          <div className="flex items-center space-x-2">
            {getStatusIcon(exercise.userStatus || userPreference?.status)}
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {exercise.name}
            </h3>
          </div>
        </div>

        {/* Description */}
        {exercise.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {exercise.description}
          </p>
        )}

        {/* Badges for difficulty, muscle groups, etc. */}
        <div className="flex flex-wrap gap-2 mb-4">
          {exercise.difficulty && (
            <Badge className={getDifficultyColor(exercise.difficulty)}>
              {exercise.difficulty}
            </Badge>
          )}
          
          {exercise.muscleGroups?.slice(0, 2).map((muscle) => (
            <Badge key={muscle} variant="secondary" className="text-xs">
              {muscle}
            </Badge>
          ))}
          
          {exercise.muscleGroups && exercise.muscleGroups.length > 2 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="text-xs">
                    +{exercise.muscleGroups.length - 2} more
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{exercise.muscleGroups.slice(2).join(', ')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Equipment tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {exercise.equipment && exercise.equipment.length > 0 ? (
            <>
              {exercise.equipment.slice(0, 3).map((item) => (
                <span 
                  key={item}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground"
                >
                  {item}
                </span>
              ))}
              {exercise.equipment.length > 3 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground cursor-help">
                        +{exercise.equipment.length - 3} more
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{exercise.equipment.slice(3).join(', ')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </>
          ) : (
            <span className="h-6"></span>
          )}
        </div>

        {/* User custom settings preview */}
        {(exercise.userCustomSettings || userPreference?.customSettings) && (
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-4 text-sm">              {(exercise.userCustomSettings?.sets || userPreference?.customSettings?.sets) && (
                <span className="flex items-center">
                  {exercise.userCustomSettings?.sets || userPreference?.customSettings?.sets} sets
                </span>
              )}
              {(exercise.userCustomSettings?.reps || userPreference?.customSettings?.reps) && (
                <span>{exercise.userCustomSettings?.reps || userPreference?.customSettings?.reps} reps</span>
              )}
              {(exercise.userCustomSettings?.weight || userPreference?.customSettings?.weight) && (
                <span>{exercise.userCustomSettings?.weight || userPreference?.customSettings?.weight} lbs</span>
              )}
            </div>
          </div>
        )}

        {/* Last used info */}
        {lastUsedText && (
          <div className="flex items-center text-xs text-muted-foreground mb-4">
            <Clock className="h-3 w-3 mr-1" />
            Last used {lastUsedText}
          </div>
        )}

        {/* User notes preview */}
        {(exercise.userNotes || userPreference?.notes) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800 line-clamp-2">
              <strong>Your notes:</strong> {exercise.userNotes || userPreference?.notes}
            </p>
          </div>
        )}        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleToggleFavorite}
            disabled={isLoading}
            variant={isFavorite ? "default" : "outline"}
            className="flex-1"
          >
            <Heart className={cn("h-4 w-4 mr-2", isFavorite && "fill-current")} />
            {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          </Button>
          
          {onViewDetails && (
            <Button 
              variant="outline"
              onClick={() => onViewDetails(exercise.id)}
            >
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ExerciseCard;
