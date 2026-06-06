interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isActive = stepNum <= currentStep;
          return (
            <div key={stepNum} className="flex items-center gap-2">
              <div
                data-testid={`step-dot-${stepNum}`}
                className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-white" : "bg-white/30"}`}
              />
              {stepNum < totalSteps && (
                <div className={`h-0.5 w-8 ${isActive ? "bg-white/60" : "bg-white/20"}`} />
              )}
            </div>
          );
        })}
      </div>
      <span className="text-sm text-white/70">
        Step {currentStep} of {totalSteps}
      </span>
    </div>
  );
}
