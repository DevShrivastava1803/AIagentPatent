
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Steps({ steps, currentStep, className }: StepsProps) {
  return (
    <div className={cn("flex", className)}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            "flex items-center",
            index !== steps.length - 1 ? "flex-1" : ""
          )}
        >
          <div className="relative flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2",
                step.id < currentStep
                  ? "border-patent-blue bg-patent-blue text-white"
                  : step.id === currentStep
                  ? "border-patent-blue text-patent-blue"
                  : "border-gray-300 text-gray-400"
              )}
            >
              {step.id < currentStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                step.id
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-sm font-medium",
                step.id <= currentStep ? "text-patent-blue" : "text-gray-500"
              )}
            >
              {step.title}
            </span>
          </div>
          {index !== steps.length - 1 && (
            <div
              className={cn(
                "h-[2px] w-full",
                step.id < currentStep
                  ? "bg-patent-blue"
                  : "bg-gray-300"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
