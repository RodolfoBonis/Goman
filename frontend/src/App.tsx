import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAPIStore } from '@/store';

function App() {
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
    </div>
  );
}

export default App;