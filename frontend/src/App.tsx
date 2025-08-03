import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ToastContainer, useToast } from '@/components/ui';
import { useAPIStore } from '@/store';

function App() {
  const { toasts, removeToast } = useToast();
  const { fetchCollections, fetchFolders, fetchRequests, fetchEnvironments } = useAPIStore();

  React.useEffect(() => {
    // Initialize data on app start
    const initializeData = async () => {
      try {
        // Fetch all data from backend
        await Promise.all([
          fetchCollections(),
          fetchFolders(),
          fetchRequests(),
          fetchEnvironments(),
        ]);
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };

    initializeData();
  }, [fetchCollections, fetchFolders, fetchRequests, fetchEnvironments]);

  return (
    <div className="App">
      <AppLayout />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}

export default App;