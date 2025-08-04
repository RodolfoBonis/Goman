import React from 'react';
import { Copy, Download, Maximize2, Minimize2 } from 'lucide-react';
import { Button, Tabs } from '@/components/ui';
import { useUIStore } from '@/store';
import { formatResponseTime, formatFileSize, getStatusColor, cn } from '@/utils';
import Editor from '@monaco-editor/react';
import { JsonViewer } from '@textea/json-viewer';
import type { APIResponse } from '@/types';

interface ResponseViewerProps {
  response?: APIResponse;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ response }) => {
  const { 
    responseTab, 
    responseBodyTab,
    setResponseTab,
    setResponseBodyTab 
  } = useUIStore();

  const [isMaximized, setIsMaximized] = React.useState(false);

  if (!response) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No response yet</h3>
          <p className="text-sm text-gray-500">Send a request to see the response here</p>
        </div>
      </div>
    );
  }

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(response.body);
    // TODO: Show success toast
  };

  const handleDownloadResponse = () => {
    const blob = new Blob([response.body], { type: response.contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${Date.now()}.${getFileExtension(response.contentType)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (contentType: string) => {
    if (contentType.includes('json')) return 'json';
    if (contentType.includes('xml')) return 'xml';
    if (contentType.includes('html')) return 'html';
    if (contentType.includes('text')) return 'txt';
    return 'txt';
  };

  const parseResponseBody = () => {
    try {
      return JSON.parse(response.body);
    } catch {
      return null;
    }
  };

  const isJsonResponse = response.contentType.includes('application/json');
  const parsedJson = isJsonResponse ? parseResponseBody() : null;
  const responseSize = new Blob([response.body]).size;

  const tabItems = [
    { id: 'body' as const, label: 'Body', badge: formatFileSize(responseSize) },
    { id: 'headers' as const, label: 'Headers' },
    { id: 'test-results' as const, label: 'Test Results' },
  ];

  const bodyTabItems = [
    { id: 'pretty' as const, label: 'Pretty' },
    { id: 'raw' as const, label: 'Raw' },
    { id: 'preview' as const, label: 'Preview' },
  ];

  return (
    <div className={cn(
      'flex flex-col bg-white transition-all duration-300',
      isMaximized ? 'fixed inset-0 z-50 border border-gray-200' : 'h-full min-h-0'
    )}>
      {/* Response Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={cn(
              'px-2 py-1 rounded text-sm font-medium flex-shrink-0',
              getStatusColor(response.status)
            )}>
              {response.statusText}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <Button
              size="sm"
              variant="ghost"
              icon={<Copy className="h-4 w-4" />}
              onClick={handleCopyResponse}
              title="Copy Response"
            />
            <Button
              size="sm"
              variant="ghost"
              icon={<Download className="h-4 w-4" />}
              onClick={handleDownloadResponse}
              title="Download Response"
            />
            <Button
              size="sm"
              variant="ghost"
              icon={isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? "Minimize" : "Maximize"}
            />
          </div>
        </div>

        {/* Response Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap min-w-0">
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="font-medium">Time:</span>
            <span>{formatResponseTime(response.responseTime)}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="font-medium">Size:</span>
            <span>{formatFileSize(responseSize)}</span>
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-medium flex-shrink-0">Type:</span>
            <span className="truncate">{response.contentType}</span>
          </div>
        </div>
      </div>

      {/* Response Tabs */}
      <div className="border-b border-gray-200">
        <Tabs
          items={tabItems}
          activeTab={responseTab}
          onChange={setResponseTab}
          variant="underline"
        />
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {responseTab === 'body' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Body Sub-tabs */}
            <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <Tabs
                items={bodyTabItems}
                activeTab={responseBodyTab}
                onChange={setResponseBodyTab}
                variant="pills"
                size="sm"
                className="p-2"
              />
            </div>

            {/* Body Content */}
            <div className="flex-1 min-h-0 relative">
              {responseBodyTab === 'pretty' && isJsonResponse && parsedJson ? (
                <div className="absolute inset-0 overflow-auto p-4">
                  <JsonViewer
                    value={parsedJson}
                    theme="light"
                    defaultInspectDepth={2}
                    enableClipboard={false}
                    style={{
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                    }}
                  />
                </div>
              ) : responseBodyTab === 'raw' ? (
                <div className="h-full">
                  <Editor
                    height="100%"
                    defaultLanguage={isJsonResponse ? 'json' : 'text'}
                    value={response.body}
                    theme="vs"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      automaticLayout: true,
                    }}
                  />
                </div>
              ) : responseBodyTab === 'preview' ? (
                <div className="h-full p-4 overflow-auto">
                  {response.contentType.includes('text/html') ? (
                    <iframe
                      srcDoc={response.body}
                      className="w-full h-full border border-gray-200 rounded-lg"
                      title="HTML Preview"
                    />
                  ) : response.contentType.includes('image/') ? (
                    <div className="flex items-center justify-center h-full overflow-auto">
                      <img
                        src={`data:${response.contentType};base64,${btoa(response.body)}`}
                        alt="Response preview"
                        className="max-w-full max-h-full"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <svg className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <p>No preview available for this content type</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {responseTab === 'headers' && (
          <div className="flex-1 flex flex-col min-h-0 p-4">
            <HeadersTable headers={JSON.parse(response.headers)} />
          </div>
        )}

        {responseTab === 'test-results' && (
          <div className="h-full p-4 overflow-auto">
            <div className="text-center text-gray-500">
              <svg className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No test results to display</p>
              <p className="text-sm">Run tests to see results here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Headers Table Component
const HeadersTable: React.FC<{ headers: Record<string, string | string[]> }> = ({ headers }) => {
  const headerEntries = Object.entries(headers);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <h4 className="text-sm font-medium text-gray-900 mb-3 flex-shrink-0">Response Headers</h4>
      
      {headerEntries.length > 0 ? (
        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden min-h-0">
          <div className="h-full overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Header
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {headerEntries.map(([key, value]) => (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {key}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono break-all">
                      {Array.isArray(value) ? value.join(', ') : value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500">No headers found</p>
        </div>
      )}
    </div>
  );
};