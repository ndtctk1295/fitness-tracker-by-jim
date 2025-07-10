"use client";

import { useState } from "react";
import { Play, Calendar, MousePointer, Zap, ChevronRight, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExerciseConversionGuideProps {
  hasActivePlan?: boolean;
  showCompact?: boolean;
}

export function ExerciseConversionGuide({ 
  hasActivePlan = false, 
  showCompact = false 
}: ExerciseConversionGuideProps) {
  const [isOpen, setIsOpen] = useState(!showCompact);

  const conversionMethods = [
    {
      icon: Play,
      title: "Activate Workout Plan",
      description: "Start following a workout plan immediately",
      difficulty: "Easy",
      recommended: true,
      steps: [
        "Browse your workout plans",
        "Click 'Activate' on your chosen plan",
        "System automatically generates this week's exercises",
        "View your scheduled workouts on the calendar"
      ],
      available: true
    },
    {
      icon: Zap,
      title: "Generate Exercises Button",
      description: "Populate calendar with upcoming exercises",
      difficulty: "Easy",
      recommended: hasActivePlan,
      steps: [
        "Go to your active workout plan",
        "Click 'Generate Exercises' in the menu",
        "Exercises for next 7 days are created",
        "Check your calendar to see scheduled workouts"
      ],
      available: hasActivePlan
    },
    {
      icon: MousePointer,
      title: "Calendar Drag & Drop",
      description: "Convert individual exercises with precision",
      difficulty: "Medium",
      recommended: false,
      steps: [
        "Open your calendar view",
        "Look for template exercises (lighter color)",
        "Drag template exercises to convert them",
        "Choose scope: single day, week, or whole plan"
      ],
      available: hasActivePlan
    },
    {
      icon: Calendar,
      title: "Bulk API Generation",
      description: "Programmatic generation for advanced users",
      difficulty: "Advanced",
      recommended: false,
      steps: [
        "Use the /api/workout-plans/generate-exercises endpoint",
        "Specify date range and workout plan ID",
        "Set replaceExisting parameter as needed",
        "Handle the API response appropriately"
      ],
      available: true
    }
  ];

  const availableMethods = conversionMethods.filter(method => method.available);
  const recommendedMethod = conversionMethods.find(method => method.recommended);

  if (showCompact && !isOpen) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm">Exercise Conversion</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(true)}
              className="text-xs"
            >
              Show Guide
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            Convert planned exercises to your calendar
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Convert Planned to Scheduled Exercises</CardTitle>
          </div>
          {showCompact && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)}
            >
              Hide
            </Button>
          )}
        </div>
        <CardDescription>
          Transform your workout plan templates into actionable exercises on your calendar
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!hasActivePlan && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>No active workout plan.</strong> Activate a workout plan first to unlock all conversion methods.
            </AlertDescription>
          </Alert>
        )}

        {recommendedMethod && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">Recommended</Badge>
              <span className="text-sm font-medium">Start here</span>
            </div>
            <ConversionMethodCard method={recommendedMethod} featured />
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">All Available Methods</h4>
          <div className="grid gap-3">
            {availableMethods.map((method, index) => (
              <ConversionMethodCard 
                key={index} 
                method={method} 
                featured={method.recommended}
              />
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Understanding Exercise Types</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
              <div>
                <strong className="text-foreground">Template Exercises:</strong> Defined in workout plan templates, not yet scheduled
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <strong className="text-foreground">Scheduled Exercises:</strong> Actual exercises on your calendar ready for execution
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ConversionMethodCardProps {
  method: {
    icon: any;
    title: string;
    description: string;
    difficulty: string;
    steps: string[];
    available: boolean;
  };
  featured?: boolean;
}

function ConversionMethodCard({ method, featured = false }: ConversionMethodCardProps) {
  const [isExpanded, setIsExpanded] = useState(featured);
  const Icon = method.icon;

  const difficultyColor = {
    'Easy': 'bg-green-500',
    'Medium': 'bg-yellow-500',
    'Advanced': 'bg-red-500'
  }[method.difficulty] || 'bg-gray-500';

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className={`transition-all ${featured ? 'ring-1 ring-primary/50' : ''} ${!method.available ? 'opacity-60' : ''}`}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <CardTitle className="text-sm">{method.title}</CardTitle>
                  <CardDescription className="text-xs">{method.description}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${difficultyColor}`}></div>
                <span className="text-xs text-muted-foreground">{method.difficulty}</span>
                <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground">Steps:</h5>
              <ol className="space-y-1">
                {method.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs">
                    <span className="flex-shrink-0 w-4 h-4 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-medium mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
