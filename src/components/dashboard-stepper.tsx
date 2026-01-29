
'use client';
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useUser } from "@/firebase";

const steps = [
  { label: 'Primary', profileCompletion: 11, step: 1 },
  { label: 'Address', profileCompletion: 22, step: 2 },
  { label: 'Parent', profileCompletion: 33, step: 3 },
  { label: 'Category', profileCompletion: 44, step: 4 },
  { label: 'Qualification', profileCompletion: 55, step: 5 },
  { label: 'Training', profileCompletion: 66, step: 6 },
  { label: 'Additional', profileCompletion: 77, step: 7 },
  { label: 'Bank', profileCompletion: 88, step: 8 },
  { label: 'Work Experience', profileCompletion: 100, step: 9 },
  { label: 'Verify', profileCompletion: 0, step: 10, disabled: true },
  { label: 'Apply', profileCompletion: 0, step: 11, disabled: true },
  { label: 'Admission Letter', profileCompletion: 0, step: 12, disabled: true },
];

export function DashboardStepper({ profileCompletion = 0 }: { profileCompletion: number }) {
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-x-8 gap-y-4 justify-items-center">
      {steps.map((step, index) => {
        const isCompleted = profileCompletion >= step.profileCompletion;
        const percentage = isCompleted ? 100 : (profileCompletion > ((steps[index-1]?.profileCompletion) || 0) ? `~${Math.floor(((profileCompletion - ((steps[index-1]?.profileCompletion) || 0) ) / (step.profileCompletion - ((steps[index-1]?.profileCompletion) || 0))) * 100)}` : 0);

        const content = (
           <div className="flex flex-col items-center">
              <div
                className={cn(
                    "w-20 h-20 rounded-full border-4 flex items-center justify-center text-lg font-semibold bg-background",
                    isCompleted ? "border-green-500 text-green-600" : "border-gray-300 text-gray-500"
                )}
              >
                {percentage}%
              </div>
              <p className="text-xs mt-1 text-center">{step.label}</p>
            </div>
        );

        return (
            <div key={step.label} className="flex items-center justify-center w-full">
                <div className="relative w-full flex justify-center">
                    {index > 0 && (
                    <div className={cn(
                        "absolute top-10 left-[-50%] w-full h-0.5 z-0",
                         profileCompletion >= steps[index-1].profileCompletion ? 'bg-green-500' : 'bg-gray-300'
                        )} />
                    )}
                    <div className="relative z-10">
                        {step.disabled ? (
                            <div className="cursor-not-allowed opacity-50">{content}</div>
                        ) : (
                            <Link href={`/candidate/profile?step=${step.step}`}>
                                {content}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
        })}
    </div>
  );
}
