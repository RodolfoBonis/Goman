import React from 'react';
import { cn } from '@/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = 'default',
    disabled,
    ...props 
  }, ref) => {
    const inputId = React.useId();
    
    const baseStyles = [
      'flex w-full rounded-lg border transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ];

    const variants = {
      default: [
        'bg-white border-gray-200',
        'hover:border-gray-300',
        'focus:border-primary-500 focus:ring-primary-500/20',
        error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : '',
      ],
      filled: [
        'bg-gray-50 border-gray-50',
        'hover:bg-gray-100 hover:border-gray-100',
        'focus:bg-white focus:border-primary-500 focus:ring-primary-500/20',
        error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : '',
      ],
    };

    const inputStyles = [
      'w-full px-3 py-2.5 text-sm bg-transparent',
      'placeholder:text-gray-400',
      'focus:outline-none',
      leftIcon ? 'pl-10' : '',
      rightIcon ? 'pr-10' : '',
    ];

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <div
            className={cn(
              baseStyles,
              variants[variant],
              className
            )}
          >
            {leftIcon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {leftIcon}
              </div>
            )}
            
            <input
              id={inputId}
              type={type}
              className={cn(inputStyles)}
              ref={ref}
              disabled={disabled}
              {...props}
            />
            
            {rightIcon && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {rightIcon}
              </div>
            )}
          </div>
        </div>
        
        {(error || helperText) && (
          <p className={cn(
            'mt-1.5 text-xs',
            error ? 'text-error-500' : 'text-gray-500'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };