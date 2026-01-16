'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', icon, error, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full rounded-lg border bg-bg-secondary px-4 py-2.5 text-foreground placeholder:text-text-muted',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent',
            icon && 'pl-10',
            error ? 'border-error' : 'border-border-subtle hover:border-border-medium',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

const SearchInput = forwardRef<HTMLInputElement, Omit<InputProps, 'icon'>>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        icon={<Search className="h-4 w-4" />}
        placeholder="Search hosts..."
        className={className}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { Input, SearchInput };
