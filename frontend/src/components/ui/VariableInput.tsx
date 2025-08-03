import React from 'react';
import { cn } from '@/utils';

interface VariableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const VariableInput: React.FC<VariableInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Highlight variables in text
  const highlightVariables = (text: string) => {
    if (!text) return text;
    
    // Regex to find variables like {{ variable }}
    const variableRegex = /(\{\{\s*[^}]+\s*\}\})/g;
    const parts = text.split(variableRegex);
    
    return parts.map((part, index) => {
      if (variableRegex.test(part)) {
        return (
          <span key={index} className="bg-blue-100 text-blue-700 px-0.5 rounded font-medium">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const hasVariables = value && value.includes('{{') && value.includes('}}');

  return (
    <div className="relative">
      {/* Highlighted overlay - only when not focused */}
      {hasVariables && !isFocused && (
        <div 
          className={cn(
            'absolute inset-0 pointer-events-none z-10 px-3 py-2.5 text-sm font-mono',
            'flex items-center whitespace-nowrap overflow-hidden',
            'border border-gray-200 rounded-md bg-white'
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {highlightVariables(value)}
        </div>
      )}
      
      {/* Actual input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
          hasVariables && !isFocused && 'text-transparent caret-transparent',
          className
        )}
      />
    </div>
  );
};