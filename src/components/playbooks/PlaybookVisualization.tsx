import { useState } from "react";
import { Playbook, PlaybookStep } from "@/types/soar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Workflow,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaybookVisualizationProps {
  playbook: Playbook;
}

const stepStatusConfig = {
  pending: {
    color: "bg-muted text-muted-foreground border-muted",
    icon: Clock,
    label: "Pending"
  },
  running: {
    color: "bg-primary text-primary-foreground border-primary animate-pulse",
    icon: Loader2,
    label: "Running"
  },
  completed: {
    color: "bg-success text-success-foreground border-success",
    icon: CheckCircle2,
    label: "Completed"
  },
  failed: {
    color: "bg-destructive text-destructive-foreground border-destructive",
    icon: AlertCircle,
    label: "Failed"
  }
};

export function PlaybookVisualization({ playbook }: PlaybookVisualizationProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState(playbook.steps);

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progress = (completedSteps / steps.length) * 100;

  const executePlaybook = async () => {
    setIsExecuting(true);
    setCurrentStepIndex(0);
    
    // Reset all steps to pending
    const resetSteps = steps.map(step => ({ ...step, status: 'pending' as const }));
    setSteps(resetSteps);
    
    // Execute steps one by one
    for (let i = 0; i < resetSteps.length; i++) {
      setCurrentStepIndex(i);
      
      // Mark current step as running
      setSteps(prevSteps => 
        prevSteps.map((step, index) => 
          index === i ? { ...step, status: 'running' } : step
        )
      );
      
      // Simulate execution time (2-4 seconds per step)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
      
      // Mark step as completed (or failed with 5% chance)
      const success = Math.random() > 0.05;
      setSteps(prevSteps => 
        prevSteps.map((step, index) => 
          index === i ? { ...step, status: success ? 'completed' : 'failed' } : step
        )
      );
      
      if (!success) {
        break; // Stop execution on failure
      }
    }
    
    setIsExecuting(false);
  };

  const getStepIcon = (step: PlaybookStep, index: number) => {
    const config = stepStatusConfig[step.status];
    const IconComponent = config.icon;
    
    return (
      <div className={cn(
        "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300",
        config.color
      )}>
        <IconComponent className={cn(
          "h-6 w-6",
          step.status === 'running' && "animate-spin"
        )} />
      </div>
    );
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-primary" />
              {playbook.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {playbook.description}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>Estimated Time: {playbook.estimatedTime}</span>
              <span>Steps: {steps.length}</span>
            </div>
          </div>
          <Button 
            onClick={executePlaybook} 
            disabled={isExecuting}
            className="min-w-32"
            size="lg"
          >
            {isExecuting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Playbook
              </>
            )}
          </Button>
        </div>
        
        {/* Progress Bar */}
        {(isExecuting || completedSteps > 0) && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Progress: {completedSteps}/{steps.length} steps completed
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Playbook Flow Visualization */}
        <div className="space-y-8">
          {/* Trigger Conditions */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
              Trigger Conditions
            </h3>
            <div className="flex flex-wrap gap-2">
              {playbook.triggerConditions.map((condition, index) => (
                <Badge key={index} variant="outline">
                  {condition}
                </Badge>
              ))}
            </div>
          </div>

          {/* Step Flow */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-6">
              Execution Flow
            </h3>
            
            <div className="relative">
              {/* Flow Line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border"></div>
              
              {steps.map((step, index) => (
                <div key={step.id} className="relative flex items-start gap-4 pb-8 last:pb-0">
                  {/* Step Icon */}
                  <div className="relative z-10">
                    {getStepIcon(step, index)}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "p-4 rounded-lg border transition-all duration-300",
                      step.status === 'running' 
                        ? "bg-primary/5 border-primary" 
                        : "bg-card border-border"
                    )}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{step.name}</h4>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "ml-2",
                            stepStatusConfig[step.status].color.replace('border-', 'border-').replace('bg-', 'bg-').replace('text-', 'text-')
                          )}
                        >
                          {stepStatusConfig[step.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                      
                      {step.status === 'running' && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Executing step...
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground absolute left-8 -bottom-2 z-10 bg-background" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}