import { Loader2 } from "lucide-react";

const heightClasses = {
  default: "min-h-[60vh]",
  full: "min-h-[80vh]",
} as const;

interface PageSpinnerProps {
  label?: string;
  size?: keyof typeof heightClasses;
}

// Shared full-section loading state so every page's "fetching data" moment
// looks and reads the same, instead of each page hand-rolling its own.
export function PageSpinner({ label, size = "default" }: PageSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${heightClasses[size]}`}>
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        {label && <p className="text-muted-foreground">{label}</p>}
      </div>
    </div>
  );
}
