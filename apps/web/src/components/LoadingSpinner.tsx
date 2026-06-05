'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  className = '',
  label = 'Loading...'
}: LoadingSpinnerProps) {
  const scaleClasses = {
    sm: 'scale-50',
    md: 'scale-75', 
    lg: 'scale-100'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`loader ${scaleClasses[size]} transform-gpu`}
        role="status"
        aria-label={label}
      />
      {label && (
        <p className="mt-2 text-sm text-discovery-grey animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}