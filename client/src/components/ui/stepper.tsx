
import { cn } from "@/lib/utils";

interface StepProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepProps) {
  return (
    <div className={cn("flex items-center w-full", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1">
          <div className="relative flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center",
                currentStep > index
                  ? "bg-primary border-primary text-primary-foreground"
                  : currentStep === index
                  ? "border-primary text-primary"
                  : "border-muted text-muted-foreground"
              )}
            >
              {currentStep > index ? "✓" : index + 1}
            </div>
            <span className="absolute top-10 text-xs text-center">{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-[2px] w-full",
                currentStep > index ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
