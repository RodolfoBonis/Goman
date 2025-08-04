import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { StatusBar } from './StatusBar';
import { TabContent } from './TabContent';
import { TabsManager } from '@/components/ui';
import { useUIStore, useTabsStore } from '@/store';
import { useAutoEnvironment } from '@/hooks/useAutoEnvironment';
import type { Request } from '@/types';
import { cn } from '@/utils';

export const AppLayout: React.FC = () => {
  const { sidebarCollapsed } = useUIStore();
  const { tabs, activeTabId, openRequestTab } = useTabsStore();
  
  // Auto-manage environments based on active tab
  useAutoEnvironment();
  
  // Response panel state (now per-tab in the future, but keeping global for now)
  const [responsePanelWidth, setResponsePanelWidth] = React.useState(() => {
    const saved = localStorage.getItem('responsePanelWidth');
    return saved ? parseInt(saved, 10) : 50;
  });
  const [responseCollapsed, setResponseCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('responseCollapsed');
    return saved === 'true';
  });


  // Save panel state to localStorage
  React.useEffect(() => {
    localStorage.setItem('responsePanelWidth', responsePanelWidth.toString());
  }, [responsePanelWidth]);

  React.useEffect(() => {
    localStorage.setItem('responseCollapsed', responseCollapsed.toString());
  }, [responseCollapsed]);

  const handleNewRequest = () => {
    // Create a new unsaved request
    const newRequest: Request = {
      id: -1, // Temporary ID for unsaved requests
      name: 'Untitled Request',
      method: 'GET',
      url: '',
      headers: '{}',
      body: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    openRequestTab(newRequest);
  };



  // Get the active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className="h-screen flex flex-col bg-gray-50 pb-6 overflow-hidden">
      {/* Top Bar */}
      <TopBar onNewRequest={handleNewRequest} />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col transition-all duration-300 min-w-0">
          {/* Tabs Manager */}
          <TabsManager onNewRequest={handleNewRequest} />
          
          {/* Tab Content */}
          {activeTab ? (
            <TabContent 
              tab={activeTab}
              responsePanelWidth={responsePanelWidth}
              responseCollapsed={responseCollapsed}
              onResponsePanelWidthChange={setResponsePanelWidth}
              onResponseCollapsedChange={setResponseCollapsed}
              className="flex-1"
            />
          ) : (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to GoMan API Client
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Create a new request or select an existing one from the sidebar to get started.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded mr-2">⌘</span>
                    <span>Quick shortcuts available</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <div>⌘ + N: New Request</div>
                    <div>⌘ + ↵: Send Request</div>
                    <div>⌘ + S: Save Request</div>
                    <div>⌘ + /: Search</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed Status Bar */}
      <StatusBar />
    </div>
  );
};