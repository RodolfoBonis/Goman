import React from 'react';
import { useTabsStore, useAPIStore } from '@/store';
import type { RequestTab } from '@/types';

/**
 * Hook that automatically manages environment activation based on the active tab
 */
export const useAutoEnvironment = () => {
  const { tabs, activeTabId } = useTabsStore();
  const { activateEnvironmentForCollection } = useAPIStore();
  
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  React.useEffect(() => {
    if (!activeTab || activeTab.type !== 'request') {
      return;
    }

    const requestTab = activeTab as RequestTab;
    const collectionId = requestTab.request.collection_id;

    // Activate the environment for this request's collection
    activateEnvironmentForCollection(collectionId);
  }, [activeTab?.id, activeTab?.type, activateEnvironmentForCollection]);

  return {
    activeTab,
    activeCollectionId: activeTab?.type === 'request' ? (activeTab as RequestTab).request.collection_id : undefined,
  };
};