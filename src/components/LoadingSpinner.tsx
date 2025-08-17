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
  const sizeClasses = {
    sm: 'w-10 h-8',
    md: 'w-20 h-16', 
    lg: 'w-24 h-20'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} loader`}
        role="status"
        aria-label={label}
      />
      {label && (
        <p className="mt-2 text-sm text-kifolio-text animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}