import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  className?: string;
  onChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  placeholder = 'Select option...',
  disabled = false,
  error,
  label,
  className,
  onChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState<SelectOption | undefined>(
    options.find(option => option.value === value)
  );
  
  const selectRef = React.useRef<HTMLDivElement>(null);
  const selectId = React.useId();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    setSelectedOption(options.find(option => option.value === value));
  }, [value, options]);

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    
    setSelectedOption(option);
    setIsOpen(false);
    onChange?.(option.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setIsOpen(false);
        }
        break;
    }
  };

  const triggerStyles = [
    'relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all duration-200',
    'bg-white border-gray-200 cursor-pointer',
    'hover:border-gray-300',
    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
    disabled ? 'cursor-not-allowed opacity-50' : '',
    error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : '',
    isOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : '',
  ];

  const dropdownStyles = [
    'absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-large z-50',
    'max-h-60 overflow-auto',
    isOpen ? 'animate-slide-down' : 'hidden',
  ];

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      
      <div ref={selectRef} className="relative">
        <div
          id={selectId}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          tabIndex={disabled ? -1 : 0}
          className={cn(triggerStyles)}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
        >
          <span className={cn(
            'block truncate text-sm',
            selectedOption ? 'text-gray-900' : 'text-gray-400'
          )}>
            {selectedOption?.label || placeholder}
          </span>
          
          <ChevronDown 
            className={cn(
              'h-4 w-4 text-gray-400 transition-transform duration-200',
              isOpen ? 'transform rotate-180' : ''
            )}
          />
        </div>

        <div className={cn(dropdownStyles)}>
          <ul role="listbox" className="py-1">
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={selectedOption?.value === option.value}
                className={cn(
                  'relative px-3 py-2 text-sm cursor-pointer transition-colors duration-150',
                  'hover:bg-gray-50',
                  option.disabled ? 'opacity-50 cursor-not-allowed' : '',
                  selectedOption?.value === option.value ? 'bg-primary-50 text-primary-600' : 'text-gray-900'
                )}
                onClick={() => handleSelect(option)}
              >
                <span className="block truncate">{option.label}</span>
                
                {selectedOption?.value === option.value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Check className="h-4 w-4 text-primary-600" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {error && (
        <p className="mt-1.5 text-xs text-error-500">{error}</p>
      )}
    </div>
  );
};