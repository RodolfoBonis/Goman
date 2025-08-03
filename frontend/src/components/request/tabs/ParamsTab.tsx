import React from 'react';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useUIStore } from '@/store';
import { generateId, parseQueryParams, buildURLWithParams } from '@/utils';
import type { KeyValue } from '@/types';

export const ParamsTab: React.FC = () => {
  const { activeRequest, updateActiveRequestField, updateActiveRequestParams } = useUIStore();

  // Parse params from URL or use existing parsed params
  const [params, setParams] = React.useState<KeyValue[]>(() => {
    if (activeRequest?.params) {
      return activeRequest.params;
    }
    return activeRequest?.url ? parseQueryParams(activeRequest.url) : [];
  });

  // Sync params when activeRequest changes
  React.useEffect(() => {
    if (activeRequest) {
      const newParams = activeRequest.params || (activeRequest.url ? parseQueryParams(activeRequest.url) : []);
      setParams(newParams);
    } else {
      setParams([]);
    }
  }, [activeRequest?.id, activeRequest?.url]);

  // Update store when params change (but not on initial mount)
  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (activeRequest) {
      updateActiveRequestParams(params);
      
      // Update URL with new params
      if (activeRequest.url) {
        const baseUrl = activeRequest.url.split('?')[0];
        const newUrl = buildURLWithParams(baseUrl, params);
        updateActiveRequestField('url', newUrl);
      }
    }
  }, [params]);

  const addParam = () => {
    setParams(prev => [...prev, {
      id: generateId(),
      key: '',
      value: '',
      enabled: true,
    }]);
  };

  const updateParam = (id: string, field: keyof KeyValue, value: string | boolean) => {
    setParams(prev => prev.map(param => 
      param.id === id ? { ...param, [field]: value } : param
    ));
  };

  const removeParam = (id: string) => {
    setParams(prev => prev.filter(param => param.id !== id));
  };

  const toggleParam = (id: string) => {
    setParams(prev => prev.map(param => 
      param.id === id ? { ...param, enabled: !param.enabled } : param
    ));
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Query Parameters</h3>
            <p className="text-xs text-gray-500 mt-1">
              Add query parameters to your request URL
            </p>
          </div>
          
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={addParam}
          >
            Add Parameter
          </Button>
        </div>
      </div>

      {/* Parameters List */}
      <div className="flex-1 overflow-y-auto">
        {params.length > 0 ? (
          <div className="p-4">
            <div className="space-y-2">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 uppercase tracking-wide pb-2">
                <div className="col-span-1"></div>
                <div className="col-span-4">Key</div>
                <div className="col-span-4">Value</div>
                <div className="col-span-2">Description</div>
                <div className="col-span-1"></div>
              </div>

              {/* Parameter Rows */}
              {params.map((param) => (
                <div
                  key={param.id}
                  className={`grid grid-cols-12 gap-3 items-center py-2 px-3 rounded-lg border transition-colors ${
                    param.enabled 
                      ? 'border-gray-200 bg-white' 
                      : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}
                >
                  {/* Enable/Disable Toggle */}
                  <div className="col-span-1">
                    <button
                      onClick={() => toggleParam(param.id)}
                      className="p-1 rounded hover:bg-gray-100 transition-colors"
                      title={param.enabled ? 'Disable parameter' : 'Enable parameter'}
                    >
                      {param.enabled ? (
                        <Eye className="h-4 w-4 text-gray-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Key Input */}
                  <div className="col-span-4">
                    <Input
                      value={param.key}
                      onChange={(e) => updateParam(param.id, 'key', e.target.value)}
                      placeholder="Parameter name"
                      className="!py-2"
                      disabled={!param.enabled}
                    />
                  </div>

                  {/* Value Input */}
                  <div className="col-span-4">
                    <Input
                      value={param.value}
                      onChange={(e) => updateParam(param.id, 'value', e.target.value)}
                      placeholder="Parameter value"
                      className="!py-2"
                      disabled={!param.enabled}
                    />
                  </div>

                  {/* Description Input */}
                  <div className="col-span-2">
                    <Input
                      value={param.description || ''}
                      onChange={(e) => updateParam(param.id, 'description', e.target.value)}
                      placeholder="Description (optional)"
                      className="!py-2"
                      disabled={!param.enabled}
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => removeParam(param.id)}
                      className="p-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-gray-400"
                      title="Remove parameter"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bulk Actions */}
            {params.length > 1 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setParams(prev => prev.map(p => ({ ...p, enabled: true })))}
                  >
                    Enable All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setParams(prev => prev.map(p => ({ ...p, enabled: false })))}
                  >
                    Disable All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setParams([])}
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
                No query parameters
              </h3>
              
              <p className="text-sm text-gray-500 mb-4">
                Add query parameters to customize your request URL
              </p>
              
              <Button
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
                onClick={addParam}
              >
                Add Parameter
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};