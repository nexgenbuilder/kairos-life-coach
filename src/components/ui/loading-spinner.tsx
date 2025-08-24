import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin text-muted-foreground',
        sizeClasses[size],
        className
      )} 
    />
  );
};

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  className 
}) => (
  <div className={cn('flex items-center justify-center p-6', className)}>
    <div className="text-center space-y-2">
      <LoadingSpinner size={size} className="mx-auto" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

interface PageLoadingProps {
  message?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({ 
  message = 'Loading page...' 
}) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingState message={message} size="lg" />
  </div>
);

export { LoadingSpinner, LoadingState, PageLoading };