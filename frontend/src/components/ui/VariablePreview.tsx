import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { substituteVariables, getActiveEnvironmentVariables } from '@/utils';
import { cn } from '@/utils';

interface VariablePreviewProps {
  text: string;
  environments: any[];
  className?: string;
  label?: string;
}

export const VariablePreview: React.FC<VariablePreviewProps> = ({
  text,
  environments,
  className,
  label = "Preview with variables:"
}) => {
  const [showPreview, setShowPreview] = React.useState(false);
  
  const variables = getActiveEnvironmentVariables(environments);
  const hasVariables = text && text.includes('{{') && text.includes('}}');
  const substitutedText = hasVariables ? substituteVariables(text, variables) : text;
  
  // Highlight variables in original text
  const highlightVariables = (text: string) => {
    if (!text) return text;
    
    // Regex to find variables like {{ variable }}
    const variableRegex = /(\{\{\s*[^}]+\s*\}\})/g;
    const parts = text.split(variableRegex);
    
    return parts.map((part, index) => {
      if (variableRegex.test(part)) {
        return (
          <span key={index} className="bg-blue-100 text-blue-700 px-1 rounded font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };
  
  // Don't render if no variables are present
  if (!hasVariables) return null;

  const hasActiveEnvironment = Object.keys(variables).length > 0;

  return (
    <div className={cn('mt-2', className)}>
      <button
        type="button"
        onClick={() => setShowPreview(!showPreview)}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        {label}
        {!hasActiveEnvironment && (
          <span className="text-orange-500 ml-1">(no active environment)</span>
        )}
      </button>
      
      {showPreview && (
        <div className="mt-1 space-y-2">
          {/* Original with highlighted variables */}
          <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs font-mono break-all">
            <div className="text-gray-500 mb-1">Original:</div>
            <div>{highlightVariables(text)}</div>
          </div>
          
          {/* Substituted version */}
          <div className={cn(
            "p-2 border rounded text-xs font-mono break-all",
            hasActiveEnvironment 
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-orange-50 border-orange-200 text-orange-800"
          )}>
            <div className="text-gray-500 mb-1">
              {hasActiveEnvironment ? 'With variables:' : 'No variables substituted:'}
            </div>
            <div>{substitutedText}</div>
          </div>
          
          {/* Variables info */}
          {hasActiveEnvironment && Object.keys(variables).length > 0 && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
              <div className="text-gray-500 mb-1">Available variables:</div>
              <div className="space-y-1">
                {Object.entries(variables).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-1 rounded font-mono">{`{{${key}}}`}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-mono text-blue-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};