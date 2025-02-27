
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function LoadingSpinner({ 
  fullScreen = false, 
  size = 'md',
  message
}: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  const containerClass = fullScreen 
    ? "min-h-screen bg-background flex flex-col items-center justify-center" 
    : "py-12 flex flex-col items-center justify-center";
    
  return (
    <div className={containerClass} role="status" aria-live="polite">
      <Loader2 className={`${sizeClass[size]} animate-spin text-primary`} aria-hidden="true" />
      {message && <p className="mt-4 text-muted-foreground">{message}</p>}
      <span className="sr-only">Loading content</span>
    </div>
  );
}
