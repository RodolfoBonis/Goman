import React from 'react';
import { cn } from '@/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onChange,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const containerStyles = {
    default: 'border-b border-gray-200',
    pills: 'bg-gray-100 p-1 rounded-lg',
    underline: 'border-b border-gray-200',
  };

  const tabStyles = {
    default: {
      base: 'px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 border-transparent',
      active: 'text-primary-600 border-primary-600',
      inactive: 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
    },
    pills: {
      base: 'px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200',
      active: 'bg-white text-gray-900 shadow-soft',
      inactive: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
    },
    underline: {
      base: 'px-1 py-2 text-sm font-medium transition-colors duration-200 border-b-2 border-transparent relative',
      active: 'text-primary-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-600',
      inactive: 'text-gray-500 hover:text-gray-700',
    },
  };

  const sizeStyles = {
    sm: {
      container: 'text-xs',
      tab: 'px-2 py-1',
    },
    md: {
      container: 'text-sm',
      tab: 'px-4 py-2',
    },
    lg: {
      container: 'text-base',
      tab: 'px-6 py-3',
    },
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('flex', containerStyles[variant])}>
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const isDisabled = item.disabled;

          return (
            <button
              key={item.id}
              type="button"
              disabled={isDisabled}
              className={cn(
                tabStyles[variant].base,
                isActive ? tabStyles[variant].active : tabStyles[variant].inactive,
                sizeStyles[size].tab,
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                'flex items-center gap-2 whitespace-nowrap'
              )}
              onClick={() => !isDisabled && onChange(item.id)}
            >
              {item.icon && (
                <span className="flex-shrink-0">
                  {item.icon}
                </span>
              )}
              
              <span>{item.label}</span>
              
              {item.badge && (
                <span className={cn(
                  'inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full',
                  isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-gray-100 text-gray-600'
                )}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};