import React from 'react';
import { Plus, Trash2, Eye, EyeOff, Info } from 'lucide-react';
import { Button, Input, VariablePreview, VariableInput } from '@/components/ui';
import { useUIStore, useAPIStore } from '@/store';
import { generateId, parseHeaders } from '@/utils';
import type { KeyValue } from '@/types';

const COMMON_HEADERS = [
  'Accept',
  'Accept-Encoding',
  'Accept-Language',
  'Authorization',
  'Cache-Control',
  'Content-Type',
  'Cookie',
  'Origin',
  'Referer',
  'User-Agent',
  'X-API-Key',
  'X-Requested-With',
];

export const HeadersTab: React.FC = () => {
  const { activeRequest, updateActiveRequestHeaders } = useUIStore();
  const { environments } = useAPIStore();

  // Parse headers from request or use existing parsed headers
  const [headers, setHeaders] = React.useState<KeyValue[]>(() => {
    if (activeRequest?.parsedHeaders) {
      return activeRequest.parsedHeaders;
    }
    return activeRequest?.headers ? parseHeaders(activeRequest.headers) : [];
  });

  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [activeSuggestionField, setActiveSuggestionField] = React.useState<string | null>(null);

  // Sync headers when activeRequest changes
  React.useEffect(() => {
    if (activeRequest) {
      const newHeaders = activeRequest.parsedHeaders || (activeRequest.headers ? parseHeaders(activeRequest.headers) : []);
      setHeaders(newHeaders);
    } else {
      setHeaders([]);
    }
  }, [activeRequest?.id, activeRequest?.headers]);

  // Update store when headers change (but not on initial mount)
  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (activeRequest) {
      updateActiveRequestHeaders(headers);
    }
  }, [headers]);

  const addHeader = () => {
    setHeaders(prev => [...prev, {
      id: generateId(),
      key: '',
      value: '',
      enabled: true,
    }]);
  };

  const updateHeader = (id: string, field: keyof KeyValue, value: string | boolean) => {
    setHeaders(prev => prev.map(header => 
      header.id === id ? { ...header, [field]: value } : header
    ));
  };

  const removeHeader = (id: string) => {
    setHeaders(prev => prev.filter(header => header.id !== id));
  };

  const toggleHeader = (id: string) => {
    setHeaders(prev => prev.map(header => 
      header.id === id ? { ...header, enabled: !header.enabled } : header
    ));
  };

  const handleKeyInputChange = (id: string, value: string) => {
    updateHeader(id, 'key', value);
    
    if (value) {
      const filtered = COMMON_HEADERS.filter(header => 
        header.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setActiveSuggestionField(id);
    } else {
      setSuggestions([]);
      setActiveSuggestionField(null);
    }
  };

  const selectSuggestion = (id: string, suggestion: string) => {
    updateHeader(id, 'key', suggestion);
    setSuggestions([]);
    setActiveSuggestionField(null);
  };

  const addCommonHeaders = () => {
    const newHeaders: KeyValue[] = [
      { id: generateId(), key: 'Content-Type', value: 'application/json', enabled: true },
      { id: generateId(), key: 'Accept', value: 'application/json', enabled: true },
    ];
    setHeaders(prev => [...prev, ...newHeaders]);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Request Headers</h3>
            <p className="text-xs text-gray-500 mt-1">
              Add custom headers to your request
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={addCommonHeaders}
            >
              Add Common
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={addHeader}
            >
              Add Header
            </Button>
          </div>
        </div>
      </div>

      {/* Headers List */}
      <div className="flex-1 overflow-y-auto">
        {headers.length > 0 ? (
          <div className="p-4">
            <div className="space-y-2">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 uppercase tracking-wide pb-2">
                <div className="col-span-1"></div>
                <div className="col-span-4">Header</div>
                <div className="col-span-4">Value</div>
                <div className="col-span-2">Description</div>
                <div className="col-span-1"></div>
              </div>

              {/* Header Rows */}
              {headers.map((header) => (
                <div key={header.id} className="relative">
                  <div
                    className={`grid grid-cols-12 gap-3 items-center py-2 px-3 rounded-lg border transition-colors ${
                      header.enabled 
                        ? 'border-gray-200 bg-white' 
                        : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                  >
                    {/* Enable/Disable Toggle */}
                    <div className="col-span-1">
                      <button
                        onClick={() => toggleHeader(header.id)}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        title={header.enabled ? 'Disable header' : 'Enable header'}
                      >
                        {header.enabled ? (
                          <Eye className="h-4 w-4 text-gray-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>

                    {/* Key Input */}
                    <div className="col-span-4 relative">
                      <Input
                        value={header.key}
                        onChange={(e) => handleKeyInputChange(header.id, e.target.value)}
                        placeholder="Header name"
                        className="!py-2"
                        disabled={!header.enabled}
                        onBlur={() => {
                          setSuggestions([]);
                          setActiveSuggestionField(null);
                        }}
                      />
                      
                      {/* Suggestions Dropdown */}
                      {activeSuggestionField === header.id && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-large z-50 max-h-40 overflow-y-auto">
                          {suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                              onMouseDown={() => selectSuggestion(header.id, suggestion)}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                                      {/* Value Input */}
                  <div className="col-span-4">
                    <VariableInput
                      value={header.value}
                      onChange={(value) => updateHeader(header.id, 'value', value)}
                      placeholder="Header value"
                      className="!py-2 text-sm"
                      disabled={!header.enabled}
                    />
                  </div>

                    {/* Description Input */}
                    <div className="col-span-2">
                      <Input
                        value={header.description || ''}
                        onChange={(e) => updateHeader(header.id, 'description', e.target.value)}
                        placeholder="Description (optional)"
                        className="!py-2"
                        disabled={!header.enabled}
                      />
                    </div>

                    {/* Delete Button */}
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => removeHeader(header.id)}
                        className="p-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-gray-400"
                        title="Remove header"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Header Tips:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Content-Type is automatically set for JSON/XML body types</li>
                    <li>• Authorization header can be managed in the Auth tab</li>
                    <li>• User-Agent is automatically added by the HTTP client</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {headers.length > 1 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setHeaders(prev => prev.map(h => ({ ...h, enabled: true })))}
                  >
                    Enable All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setHeaders(prev => prev.map(h => ({ ...h, enabled: false })))}
                  >
                    Disable All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setHeaders([])}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                No headers added
              </h3>
              
              <p className="text-sm text-gray-500 mb-4">
                Add custom headers to include additional information with your request
              </p>
              
              <div className="flex items-center gap-2 justify-center">
                <Button
                  variant="secondary"
                  onClick={addCommonHeaders}
                >
                  Add Common Headers
                </Button>
                <Button
                  variant="primary"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={addHeader}
                >
                  Add Header
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};