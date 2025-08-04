import React from 'react';
import { Play, Save, Copy, MoreHorizontal } from 'lucide-react';
import { Button, Input, Select, Tabs, VariablePreview, VariableInput, Toast } from '@/components/ui';
import { useUIStore, useAPIStore } from '@/store';
import { cn, getMethodColor, applyEnvironmentVariables } from '@/utils';
import { ParamsTab } from './tabs/ParamsTab';
import { AuthTab } from './tabs/AuthTab';
import { HeadersTab } from './tabs/HeadersTab';
import { BodyTab } from './tabs/BodyTab';
import { TestsTab } from './tabs/TestsTab';
import { SaveRequestModal } from '@/components/modals/SaveRequestModal';
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
  const { activeTab, setActiveTab, activeRequest, setActiveRequest, updateActiveRequestField } = useUIStore();
  const { executeRequest, environments, createRequest, updateRequest } = useAPIStore();
  
  const [isExecutingRequest, setIsExecutingRequest] = React.useState(false);
  const [showSaveRequestModal, setShowSaveRequestModal] = React.useState(false);
  const [toast, setToast] = React.useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  // Use activeRequest from store or fallback to initialRequest
  const currentRequest = activeRequest || initialRequest || {
    id: -1,
    name: 'Untitled Request',
    method: 'GET' as const,
    url: '',
    headers: '{}',
    body: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Sync activeRequest with initialRequest when it changes (but don't overwrite existing changes)
  const hasSetDefault = React.useRef(false);
  
  React.useEffect(() => {
    if (initialRequest && (!activeRequest || activeRequest.id !== initialRequest.id)) {
      // Only set activeRequest if it's a different request or no active request
      setActiveRequest(initialRequest);
      hasSetDefault.current = true;
    } else if (!activeRequest && !hasSetDefault.current) {
      // Create a default request if none exists
      const defaultRequest = {
        id: -1,
        name: 'Untitled Request',
        method: 'GET' as const,
        url: '',
        headers: '{}',
        body: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setActiveRequest(defaultRequest);
      hasSetDefault.current = true;
    }
  }, [initialRequest?.id, setActiveRequest]);

  // We don't need updateRequestField since the tabs will handle store updates directly

  const handleSaveClick = () => {
    if (!currentRequest) return;
    
    // Se a request já está salva (tem collection_id), apenas mostra mensagem de sucesso
    if (currentRequest.collection_id) {
      const { collections, folders } = useAPIStore.getState();
      const collection = collections.find(c => c.id === currentRequest.collection_id);
      const folder = currentRequest.folder_id ? folders.find(f => f.id === currentRequest.folder_id) : null;
      
      let location = collection?.name || 'Unknown collection';
      if (folder) {
        location = `${collection?.name} > ${folder.name}`;
      }
      
      setToast({
        message: `Request already saved in ${location}`,
        type: 'success',
        isVisible: true,
      });
      return;
    }
    
    // Se não está salva, abre o modal
    setShowSaveRequestModal(true);
  };

  const handleSaveRequest = async (name: string, collectionId?: number, folderId?: number) => {
    if (!currentRequest) return;
    
    try {
      if (currentRequest.id === -1) {
        // Create new request
        const newRequest = await createRequest(
          name,
          currentRequest.method,
          currentRequest.url,
          currentRequest.headers,
          currentRequest.body,
          collectionId,
          folderId
        );
        setActiveRequest(newRequest);
        console.log('✅ Request created successfully:', newRequest);
      } else {
        // Update existing request
        const updatedRequest = await updateRequest(
          currentRequest.id,
          name,
          currentRequest.method,
          currentRequest.url,
          currentRequest.headers,
          currentRequest.body,
          collectionId,
          folderId
        );
        setActiveRequest(updatedRequest);
        console.log('✅ Request updated successfully:', updatedRequest);
      }
    } catch (error) {
      console.error('❌ Failed to save request:', error);
    }
  };

  const handleSendRequest = async () => {
    if (isExecutingRequest) return;

    setIsExecutingRequest(true);
    onExecutionStart?.();
    
    try {
      // Apply environment variables to request data
      const processedRequest = applyEnvironmentVariables({
        url: currentRequest.url,
        headers: currentRequest.headers,
        body: currentRequest.body,
      }, environments);

      const response = await executeRequest(
        currentRequest.method,
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
      badge: currentRequest.params?.filter(p => p.enabled).length || undefined,
    },
    {
      id: 'auth' as const,
      label: 'Authorization',
    },
    {
      id: 'headers' as const,
      label: 'Headers',
      badge: currentRequest.parsedHeaders?.filter(h => h.enabled).length || undefined,
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
              {currentRequest.name}
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
              onClick={handleSaveClick}
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
                value={currentRequest.method}
                onChange={(value) => updateActiveRequestField('method', value as HTTPMethod)}
              />
            </div>

            <div className="flex-1 min-w-0">
              <VariableInput
                value={currentRequest.url}
                onChange={(value) => updateActiveRequestField('url', value)}
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
              text={currentRequest.url}
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
        {activeTab === 'params' && <ParamsTab />}
        {activeTab === 'auth' && <AuthTab />}
        {activeTab === 'headers' && <HeadersTab />}
        {activeTab === 'body' && <BodyTab />}
        {activeTab === 'tests' && <TestsTab />}
      </div>

      {/* Save Request Modal */}
      <SaveRequestModal
        isOpen={showSaveRequestModal}
        onClose={() => setShowSaveRequestModal(false)}
        onSubmit={handleSaveRequest}
        request={currentRequest}
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};