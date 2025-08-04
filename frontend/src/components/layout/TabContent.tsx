import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RequestBuilder } from '@/components/request/RequestBuilder';
import { ResponseViewer } from '@/components/request/ResponseViewer';
import { CollectionDetailsView } from '@/components/collection/CollectionDetailsView';
import { useAPIStore, useTabsStore } from '@/store';
import { cn } from '@/utils';
import type { Tab, RequestTab, CollectionTab } from '@/types';

interface TabContentProps {
  tab: Tab;
  responsePanelWidth: number;
  responseCollapsed: boolean;
  onResponsePanelWidthChange: (width: number) => void;
  onResponseCollapsedChange: (collapsed: boolean) => void;
  className?: string;
}

export const TabContent: React.FC<TabContentProps> = ({
  tab,
  responsePanelWidth,
  responseCollapsed,
  onResponsePanelWidthChange,
  onResponseCollapsedChange,
  className,
}) => {
  const { folders, requests } = useAPIStore();
  const { updateTab } = useTabsStore();
  
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Mouse drag handlers for resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((containerRect.right - e.clientX) / containerRect.width) * 100;
      
      // Limitar entre 25% e 75%
      const clampedWidth = Math.max(25, Math.min(75, newWidth));
      onResponsePanelWidthChange(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onResponsePanelWidthChange]);

  const toggleResponsePanel = () => {
    onResponseCollapsedChange(!responseCollapsed);
  };

  const resetPanelWidth = () => {
    onResponsePanelWidthChange(50);
  };

  if (tab.type === 'request') {
    const requestTab = tab as RequestTab;
    
    return (
      <div className={cn(className, isDragging && "select-none")}>
        <div ref={containerRef} className="flex h-full relative">
          {/* Request Builder */}
          <div 
            className="flex flex-col border-r border-gray-200 min-w-0"
            style={{ 
              width: requestTab.response && !responseCollapsed 
                ? `${100 - responsePanelWidth}%` 
                : '100%' 
            }}
          >
            <RequestBuilder 
              key={requestTab.request.id}
              initialRequest={requestTab.request}
              onRequestUpdate={(updatedRequest) => {
                updateTab(tab.id, {
                  request: updatedRequest,
                  unsavedChanges: true,
                  title: updatedRequest.name || 'Untitled Request',
                } as Partial<RequestTab>);
              }}
              onResponseUpdate={(response) => {
                updateTab(tab.id, {
                  response,
                  isExecuting: false,
                } as Partial<RequestTab>);
              }}
              onExecutionStart={() => {
                updateTab(tab.id, {
                  isExecuting: true,
                } as Partial<RequestTab>);
              }}
            />
          </div>

          {/* Resizer */}
          {requestTab.response && !responseCollapsed && (
            <div
              className={cn(
                "w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize flex-shrink-0 relative group transition-colors",
                isDragging && "bg-blue-500"
              )}
              onMouseDown={handleMouseDown}
              onDoubleClick={resetPanelWidth}
              title="Drag to resize • Double-click to reset"
            >
              <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-gray-300/50 transition-colors" />
              {/* Visual indicator dots */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex flex-col gap-0.5">
                  <div className="w-0.5 h-0.5 bg-gray-600 rounded-full"></div>
                  <div className="w-0.5 h-0.5 bg-gray-600 rounded-full"></div>
                  <div className="w-0.5 h-0.5 bg-gray-600 rounded-full"></div>
                </div>
              </div>
            </div>
          )}

          {/* Response Viewer */}
          {requestTab.response && (
            <>
              {!responseCollapsed ? (
                <div 
                  className="flex flex-col min-h-0"
                  style={{ 
                    width: `${responsePanelWidth}%`,
                    minWidth: '280px' // Largura mínima para não cortar conteúdo
                  }}
                >
                  {/* Response Header with Collapse Button */}
                  <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <h3 className="text-sm font-medium text-gray-700">Response</h3>
                    <button
                      onClick={toggleResponsePanel}
                      className="p-1 rounded hover:bg-gray-200 transition-colors"
                      title="Collapse response panel"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="flex-1 min-h-0">
                    <ResponseViewer response={requestTab.response} />
                  </div>
                </div>
              ) : (
                /* Collapsed Response Panel */
                <div className="w-8 bg-gray-50 border-l border-gray-200 flex flex-col items-center py-2">
                  <button
                    onClick={toggleResponsePanel}
                    className="p-1 rounded hover:bg-gray-200 transition-colors mb-2"
                    title="Expand response panel"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <div className="writing-mode-vertical text-xs text-gray-500 font-medium tracking-wide">
                      RESPONSE
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  } else if (tab.type === 'collection') {
    const collectionTab = tab as CollectionTab;
    
    return (
      <div className={className}>
        <CollectionDetailsView 
          collection={collectionTab.collection}
          className="h-full"
        />
      </div>
    );
  }

  return null;
};