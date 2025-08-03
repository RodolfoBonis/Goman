import React from 'react';
import { Play, Save, Copy, MoreHorizontal } from 'lucide-react';
import { Button, Input, Select, Tabs, VariablePreview, VariableInput } from '@/components/ui';
import { useUIStore, useAPIStore } from '@/store';
import { cn, getMethodColor, applyEnvironmentVariables } from '@/utils';
import { ParamsTab } from './tabs/ParamsTab';
import { AuthTab } from './tabs/AuthTab';
import { HeadersTab } from './tabs/HeadersTab';
import { BodyTab } from './tabs/BodyTab';
import { TestsTab } from './tabs/TestsTab';
import type { HTTPMethod, Request, APIResponse } from '@/types';

const HTTP_METHODS: { value: HTTPMethod; label: string }[] = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'HEAD', label: 'HEAD' },
  { value: 'OPTIONS', label: 'OPTIONS' },
];

interface RequestBuilderProps {
  initialRequest?: Request;
  onRequestUpdate?: (request: Request) => void;
  onResponseUpdate?: (response: APIResponse) => void;
  onExecutionStart?: () => void;
  className?: string;
}

export const RequestBuilder: React.FC<RequestBuilderProps> = ({
  initialRequest,
  onRequestUpdate,
  onResponseUpdate,
  onExecutionStart,
  className,
}) => {
  const { activeTab, setActiveTab } = useUIStore();
  const { executeRequest, environments } = useAPIStore();
  
  const [request, setRequest] = React.useState<Request>(
    initialRequest || {
      id: -1,
      name: 'Untitled Request',
      method: 'GET',
      url: '',
      headers: '{}',
      body: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  );
  const [isExecutingRequest, setIsExecutingRequest] = React.useState(false);

  // Update local state when initialRequest changes
  React.useEffect(() => {
    if (initialRequest) {
      setRequest(initialRequest);
    }
  }, [initialRequest]);

  // Update field helper
  const updateRequestField = <K extends keyof Request>(field: K, value: Request[K]) => {
    const updatedRequest = { ...request, [field]: value };
    setRequest(updatedRequest);
    onRequestUpdate?.(updatedRequest);
  };

  const handleSendRequest = async () => {
    if (isExecutingRequest) return;

    setIsExecutingRequest(true);
    onExecutionStart?.();
    
    try {
      // Apply environment variables to request data
      const processedRequest = applyEnvironmentVariables({
        url: request.url,
        headers: request.headers,
        body: request.body,
      }, environments);

      const response = await executeRequest(
        request.method,
        processedRequest.url,
        processedRequest.headers,
        processedRequest.body
      );
      
      onResponseUpdate?.(response);
    } catch (error) {
      console.error('Request failed:', error);
      // TODO: Show error toast
    } finally {
      setIsExecutingRequest(false);
    }
  };

  const tabItems = [
    {
      id: 'params' as const,
      label: 'Params',
      badge: request.params?.filter(p => p.enabled).length || undefined,
    },
    {
      id: 'auth' as const,
      label: 'Authorization',
    },
    {
      id: 'headers' as const,
      label: 'Headers',
      badge: request.parsedHeaders?.filter(h => h.enabled).length || undefined,
    },
    {
      id: 'body' as const,
      label: 'Body',
    },
    {
      id: 'tests' as const,
      label: 'Tests',
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Request Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {request.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              icon={<Copy className="h-4 w-4" />}
              title="Duplicate Request"
            />
            <Button
              size="sm"
              variant="ghost"
              icon={<Save className="h-4 w-4" />}
              title="Save Request"
            />
            <Button
              size="sm"
              variant="ghost"
              icon={<MoreHorizontal className="h-4 w-4" />}
              title="More Actions"
            />
          </div>
        </div>

        {/* URL Builder */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-32 flex-shrink-0">
              <Select
                options={HTTP_METHODS}
                value={request.method}
                onChange={(value) => updateRequestField('method', value as HTTPMethod)}
              />
            </div>

            <div className="flex-1 min-w-0">
              <VariableInput
                value={request.url}
                onChange={(value) => updateRequestField('url', value)}
                placeholder="Enter request URL"
                className="font-mono text-sm"
              />
            </div>

            <div className="flex-shrink-0">
              <Button
                variant="primary"
                loading={isExecutingRequest}
                icon={<Play className="h-4 w-4" />}
                onClick={handleSendRequest}
                className="!px-6"
              >
                Send
              </Button>
            </div>
          </div>

          {/* Variable Preview - Full width below */}
          <div className="pl-[8.5rem]">
            <VariablePreview
              text={request.url}
              environments={environments}
              label="URL with variables:"
            />
          </div>
        </div>
      </div>

      {/* Request Tabs */}
      <div className="border-b border-gray-200">
        <Tabs
          items={tabItems}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="underline"
        />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'params' && <ParamsTab activeRequest={request} updateActiveRequestField={updateRequestField} />}
        {activeTab === 'auth' && <AuthTab activeRequest={request} updateActiveRequestField={updateRequestField} />}
        {activeTab === 'headers' && <HeadersTab activeRequest={request} updateActiveRequestField={updateRequestField} />}
        {activeTab === 'body' && <BodyTab activeRequest={request} updateActiveRequestField={updateRequestField} />}
        {activeTab === 'tests' && <TestsTab activeRequest={request} updateActiveRequestField={updateRequestField} />}
      </div>
    </div>
  );
};