"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
}

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="hidden md:block w-full py-4 mb-8">
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isCurrent = currentStep === index;

          return (
            <div
              key={step}
              className={cn("flex flex-col  flex-1 items-center", index === 0 && "items-start", index === steps.length - 1 && "items-end")}
            >
              <div className="flex items-center w-full">
                <div className={`w-full h-1 ${index === 0 ? 'hidden' : ''} ${isCompleted ? 'bg-[#8DC640]' : 'bg-[#E5E7EB]'
                  }`} />
                <div className={`w-[45px] h-[35px] rounded-full flex items-center justify-center border-2 transition-colors
                  ${isCompleted ? 'bg-[#8DC640] border-[#8DC640] text-white' :
                    isCurrent ? 'border-[#1B75BB] bg-white text-[#1B75BB]' : 'border-[#E5E7EB] bg-white text-[#939597]'}`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className={`w-full h-1 ${index === steps.length - 1 ? 'hidden' : ''} ${isCompleted ? 'bg-[#8DC640]' : 'bg-[#E5E7EB]'
                  }`} />
              </div>
              <span className={`mt-3 text-sm font-medium ${isCurrent ? 'text-[#1B75BB]' : 'text-[#939597]'
                }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}