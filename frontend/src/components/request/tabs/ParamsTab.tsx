import React from 'react';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useUIStore } from '@/store';
import { generateId, parseQueryParams, buildURLWithParams } from '@/utils';
import type { KeyValue } from '@/types';

export const ParamsTab: React.FC = () => {
  const { activeRequest, updateActiveRequestField, updateActiveRequestParams } = useUIStore();

  // Use store values directly
  const params = activeRequest?.params || (activeRequest?.url ? parseQueryParams(activeRequest.url) : []);

  const setParams = (newParams: KeyValue[]) => {
    if (activeRequest) {
      updateActiveRequestParams(newParams);
      
      // Update URL with new params
      if (activeRequest.url) {
        const baseUrl = activeRequest.url.split('?')[0];
        const newUrl = buildURLWithParams(baseUrl, newParams);
        updateActiveRequestField('url', newUrl);
      }
    }
  };

  const addParam = () => {
    const newParams = [...params, {
      id: generateId(),
      key: '',
      value: '',
      enabled: true,
    }];
    setParams(newParams);
  };

  const updateParam = (id: string, field: keyof KeyValue, value: string | boolean) => {
    const newParams = params.map(param => 
      param.id === id ? { ...param, [field]: value } : param
    );
    setParams(newParams);
  };

  const removeParam = (id: string) => {
    const newParams = params.filter(param => param.id !== id);
    setParams(newParams);
  };

  const toggleParam = (id: string) => {
    const newParams = params.map(param => 
      param.id === id ? { ...param, enabled: !param.enabled } : param
    );
    setParams(newParams);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Query Parameters</h3>
            <p className="text-xs text-gray-500 mt-1">
              Add query parameters to your request URL • {params.filter(p => p.enabled).length} active
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {params.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const newParams = params.map(p => ({ ...p, enabled: !p.enabled }));
                  setParams(newParams);
                }}
                className="text-xs"
              >
                Toggle All
              </Button>
            )}
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
                    onClick={() => {
                      const newParams = params.map(p => ({ ...p, enabled: true }));
                      setParams(newParams);
                    }}
                  >
                    Enable All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const newParams = params.map(p => ({ ...p, enabled: false }));
                      setParams(newParams);
                    }}
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
          <div className="flex-1 flex flex-col justify-center p-8">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                No Query Parameters
              </h3>
              
              <p className="text-sm text-gray-500 mb-6">
                Add query parameters to customize your request URL. These will be appended to your URL automatically.
              </p>

              {/* Quick Templates */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Common Parameters</h4>
                
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      const commonParams = [
                        { id: generateId(), key: 'page', value: '1', enabled: true },
                        { id: generateId(), key: 'limit', value: '10', enabled: true },
                      ];
                      setParams(commonParams);
                    }}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">Pagination</span>
                      <p className="text-xs text-gray-500">page=1&limit=10</p>
                    </div>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => {
                      const apiParams = [
                        { id: generateId(), key: 'api_key', value: `${'{{api_key}}'}`, enabled: true },
                        { id: generateId(), key: 'format', value: 'json', enabled: true },
                      ];
                      setParams(apiParams);
                    }}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">API Authentication</span>
                      <p className="text-xs text-gray-500">api_key=&#123;&#123;api_key&#125;&#125;&format=json</p>
                    </div>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => {
                      const searchParams = [
                        { id: generateId(), key: 'q', value: `${'{{search_term}}'}`, enabled: true },
                        { id: generateId(), key: 'sort', value: 'created_at', enabled: true },
                        { id: generateId(), key: 'order', value: 'desc', enabled: true },
                      ];
                      setParams(searchParams);
                    }}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">Search & Sort</span>
                      <p className="text-xs text-gray-500">q=&#123;&#123;search_term&#125;&#125;&sort=created_at&order=desc</p>
                    </div>
                    <Plus className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
              
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