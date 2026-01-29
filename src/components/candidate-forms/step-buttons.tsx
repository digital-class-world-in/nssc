
'use client';

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface StepButtonsProps {
    onReset: () => void;
    onBack?: () => void;
    isNextDisabled?: boolean;
}

export function StepButtons({ onReset, onBack, isNextDisabled = false }: StepButtonsProps) {
    return (
        <div className="flex justify-center gap-4 pt-8">
            {onBack && <Button type="button" onClick={onBack} variant="outline">Back</Button>}
            <Button type="button" onClick={onReset} variant="destructive">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isNextDisabled}>
              Save & Next
            </Button>
        </div>
    );
}
