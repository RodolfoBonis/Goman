import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { 
  Collection, 
  Folder, 
  Request, 
  Environment, 
  RequestHistory, 
  APIResponse,
  CollectionTreeItem,
  KeyValue,
  HTTPMethod,
  Tab,
  RequestTab,
  CollectionTab,
  TabsState,
} from '@/types';
import { generateId, parseHeaders, serializeHeaders } from '@/utils';
import { apiService } from '@/services/api';

// API Service Store
interface APIServiceState {
  collections: Collection[];
  folders: Folder[];
  requests: Request[];
  environments: Environment[];
  history: RequestHistory[];
  
  // Actions
  createCollection: (name: string, description: string, environmentId?: number) => Promise<Collection>;
  updateCollection: (id: number, name: string, description: string, environmentId?: number) => Promise<Collection>;
  deleteCollection: (id: number) => Promise<void>;
  
  createFolder: (name: string, collectionId: number, parentFolderId?: number) => Promise<Folder>;
  updateFolder: (id: number, name: string, collectionId: number, parentFolderId?: number) => Promise<Folder>;
  deleteFolder: (id: number) => Promise<void>;
  
  createRequest: (
    name: string, 
    method: HTTPMethod, 
    url: string, 
    headers: string, 
    body: string, 
    collectionId?: number, 
    folderId?: number
  ) => Promise<Request>;
  updateRequest: (
    id: number,
    name: string, 
    method: HTTPMethod, 
    url: string, 
    headers: string, 
    body: string, 
    collectionId?: number, 
    folderId?: number
  ) => Promise<Request>;
  deleteRequest: (id: number) => Promise<void>;
  
  // Move operations
  moveRequest: (requestId: number, newCollectionId?: number, newFolderId?: number) => Promise<void>;
  moveFolder: (folderId: number, newCollectionId?: number, newParentFolderId?: number) => Promise<void>;
  
  createEnvironment: (name: string, variables: string) => Promise<Environment>;
  updateEnvironment: (id: number, name: string, variables: string, isActive: boolean) => Promise<Environment>;
  deleteEnvironment: (id: number) => Promise<void>;
  
  executeRequest: (method: HTTPMethod, url: string, headers: string, body: string) => Promise<APIResponse>;
  
  // Data fetchers
  fetchCollections: () => Promise<void>;
  fetchFolders: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  fetchEnvironments: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  
  // Computed
  getCollectionTree: () => CollectionTreeItem[];
  getActiveEnvironment: () => Environment | undefined;
  getCollectionEnvironment: (collectionId: number) => Environment | undefined;
  activateEnvironmentForCollection: (collectionId?: number) => void;
}

// UI State Store
interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  activeCollection?: number;
  expandedFolders: Set<number>;
  expandedCollections: Set<number>;
  searchQuery: string;
  selectedItem?: { type: 'collection' | 'folder' | 'request'; id: number };
  
  // Request Builder
  activeRequest?: Request;
  unsavedChanges: boolean;
  activeTab: 'params' | 'auth' | 'headers' | 'body' | 'tests';
  
  // Response Viewer
  lastResponse?: APIResponse;
  responseTab: 'body' | 'headers' | 'test-results';
  responseBodyTab: 'pretty' | 'raw' | 'preview';
  
  // Loading states
  isExecutingRequest: boolean;
  
  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveCollection: (id?: number) => void;
  toggleFolderExpanded: (id: number) => void;
  toggleCollectionExpanded: (id: number) => void;
  setSearchQuery: (query: string) => void;
  setSelectedItem: (item?: { type: 'collection' | 'folder' | 'request'; id: number }) => void;
  
  setActiveRequest: (request?: Request) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
  setActiveTab: (tab: 'params' | 'auth' | 'headers' | 'body' | 'tests') => void;
  
  setLastResponse: (response?: APIResponse) => void;
  setResponseTab: (tab: 'body' | 'headers' | 'test-results') => void;
  setResponseBodyTab: (tab: 'pretty' | 'raw' | 'preview') => void;
  
  setIsExecutingRequest: (loading: boolean) => void;
  
  // Request Builder Helpers
  updateActiveRequestField: <K extends keyof Request>(field: K, value: Request[K]) => void;
  updateActiveRequestHeaders: (headers: KeyValue[]) => void;
  updateActiveRequestParams: (params: KeyValue[]) => void;
}

// Use API Client Service instead of mock

// API Service Store Implementation
export const useAPIStore = create<APIServiceState>()(
  devtools(
    (set, get) => ({
      collections: [],
      folders: [],
      requests: [],
      environments: [],
      history: [],
      
      async createCollection(name: string, description: string, environmentId?: number) {
        const collection = await apiService.createCollection(name, description, environmentId);
        set(state => ({ collections: [...state.collections, collection] }));
        return collection;
      },
      
      async updateCollection(id: number, name: string, description: string, environmentId?: number) {
        const collection = await apiService.updateCollection(id, name, description, environmentId);
        set(state => ({
          collections: state.collections.map(c => c.id === id ? collection : c)
        }));
        return collection;
      },
      
      async deleteCollection(id: number) {
        await apiService.deleteCollection(id);
        set(state => ({ collections: state.collections.filter(c => c.id !== id) }));
      },
      
      async createFolder(name: string, collectionId: number, parentFolderId?: number) {
        const folder = await apiService.createFolder(name, collectionId, parentFolderId);
        set(state => ({ folders: [...state.folders, folder] }));
        return folder;
      },
      
      async updateFolder(id: number, name: string, collectionId: number, parentFolderId?: number) {
        const folder = await apiService.updateFolder(id, name, collectionId, parentFolderId);
        set(state => ({
          folders: state.folders.map(f => f.id === id ? folder : f)
        }));
        return folder;
      },
      
      async deleteFolder(id: number) {
        await apiService.deleteFolder(id);
        set(state => ({ folders: state.folders.filter(f => f.id !== id) }));
      },
      
      async createRequest(name: string, method: HTTPMethod, url: string, headers: string, body: string, collectionId?: number, folderId?: number) {
        const request = await apiService.createRequest(name, method, url, headers, body, collectionId, folderId);
        set(state => ({ requests: [...state.requests, request] }));
        return request;
      },
      
      async updateRequest(id: number, name: string, method: HTTPMethod, url: string, headers: string, body: string, collectionId?: number, folderId?: number) {
        const request = await apiService.updateRequest(id, name, method, url, headers, body, collectionId, folderId);
        set(state => ({
          requests: state.requests.map(r => r.id === id ? request : r)
        }));
        return request;
      },
      
      async deleteRequest(id: number) {
        await apiService.deleteRequest(id);
        set(state => ({ requests: state.requests.filter(r => r.id !== id) }));
      },

      async moveRequest(requestId: number, newCollectionId?: number, newFolderId?: number) {
        try {
          const request = get().requests.find(r => r.id === requestId);
          if (!request) throw new Error('Request not found');

          // Update the request with new collection/folder
          const updatedRequest = await apiService.updateRequest(
            requestId,
            request.name,
            request.method,
            request.url,
            request.headers,
            request.body,
            newCollectionId,
            newFolderId
          );

          // Update local state
          set(state => ({
            requests: state.requests.map(r => 
              r.id === requestId ? updatedRequest : r
            )
          }));

          console.log('Request moved successfully:', { requestId, newCollectionId, newFolderId });
        } catch (error) {
          console.error('Error moving request:', error);
          throw error;
        }
      },

      async moveFolder(folderId: number, newCollectionId?: number, newParentFolderId?: number) {
        try {
          const folder = get().folders.find(f => f.id === folderId);
          if (!folder) throw new Error('Folder not found');

          // Update the folder with new collection/parent
          const updatedFolder = await apiService.updateFolder(
            folderId,
            folder.name,
            newCollectionId || folder.collection_id,
            newParentFolderId
          );

          // Update local state
          set(state => ({
            folders: state.folders.map(f => 
              f.id === folderId ? updatedFolder : f
            )
          }));

          console.log('Folder moved successfully:', { folderId, newCollectionId, newParentFolderId });
        } catch (error) {
          console.error('Error moving folder:', error);
          throw error;
        }
      },
      
      async createEnvironment(name: string, variables: string) {
        const environment = await apiService.createEnvironment(name, variables);
        set(state => ({ environments: [...state.environments, environment] }));
        return environment;
      },
      
      async updateEnvironment(id: number, name: string, variables: string, isActive: boolean) {
        const environment = await apiService.updateEnvironment(id, name, variables, isActive);
        set(state => ({
          environments: state.environments.map(e => ({
            ...e,
            ...(e.id === id ? environment : { is_active: isActive ? false : e.is_active })
          }))
        }));
        return environment;
      },
      
      async deleteEnvironment(id: number) {
        await apiService.deleteEnvironment(id);
        set(state => ({ environments: state.environments.filter(e => e.id !== id) }));
      },
      
      async executeRequest(method: HTTPMethod, url: string, headers: string, body: string) {
        return await apiService.executeRequest(method, url, headers, body);
      },
      
      async fetchCollections() {
        const collections = await apiService.getCollections();
        set({ collections });
      },
      
      async fetchFolders() {
        const folders = await apiService.getFolders();
        set({ folders });
      },
      
      async fetchRequests() {
        const requests = await apiService.getRequests();
        set({ requests });
      },
      
      async fetchEnvironments() {
        const environments = await apiService.getEnvironments();
        set({ environments });
      },
      
      async fetchHistory() {
        const history = await apiService.getRequestHistory();
        set({ history });
      },
      
      getCollectionTree(): CollectionTreeItem[] {
        const { collections, folders, requests } = get();
        
        // Validate data integrity
        const validateData = () => {
          const orphanedFolders = folders.filter(f => !collections.find(c => c.id === f.collection_id));
          const orphanedRequests = requests.filter(r => !collections.find(c => c.id === r.collection_id));
          const invalidFolderRequests = requests.filter(r => r.folder_id && !folders.find(f => f.id === r.folder_id));
          
          if (orphanedFolders.length > 0) {
            console.warn('Orphaned folders found:', orphanedFolders);
          }
          if (orphanedRequests.length > 0) {
            console.warn('Orphaned requests found:', orphanedRequests);
          }
          if (invalidFolderRequests.length > 0) {
            console.warn('Requests with invalid folder_id found:', invalidFolderRequests);
          }
        };
        
        validateData();
        
        const buildTree = (parentId?: number): CollectionTreeItem[] => {
          const items: CollectionTreeItem[] = [];
          
          // Add collections at root level
          if (!parentId) {
            collections.forEach(collection => {
              items.push({
                id: collection.id,
                name: collection.name,
                type: 'collection',
                children: buildTree(collection.id),
              });
            });
          } else {
            // Add folders and requests for this parent
            const collectionFolders = folders.filter(f => f.collection_id === parentId && !f.parent_folder_id);
            const collectionRequests = requests.filter(r => r.collection_id === parentId && !r.folder_id);
            

            
            collectionFolders.forEach(folder => {
              items.push({
                id: folder.id,
                name: folder.name,
                type: 'folder',
                collection_id: folder.collection_id,
                children: buildFolderTree(folder.id),
              });
            });
            
            collectionRequests.forEach(request => {
              items.push({
                id: request.id,
                name: request.name,
                type: 'request',
                collection_id: request.collection_id,
                method: request.method,
              });
            });
          }
          
          return items;
        };
        
        const buildFolderTree = (folderId: number): CollectionTreeItem[] => {
          const items: CollectionTreeItem[] = [];
          
          // Add subfolders
          const subfolders = folders.filter(f => f.parent_folder_id === folderId);
          const folderRequests = requests.filter(r => r.folder_id === folderId);
          

          
          subfolders.forEach(folder => {
            items.push({
              id: folder.id,
              name: folder.name,
              type: 'folder',
              collection_id: folder.collection_id,
              parent_folder_id: folder.parent_folder_id,
              children: buildFolderTree(folder.id),
            });
          });
          
          // Add requests in this folder
          folderRequests.forEach(request => {
            items.push({
              id: request.id,
              name: request.name,
              type: 'request',
              collection_id: request.collection_id,
              method: request.method,
            });
          });
          
          return items;
        };
        
        return buildTree();
      },
      
      getActiveEnvironment() {
        return get().environments.find(env => env.is_active);
      },
      
      getCollectionEnvironment(collectionId: number) {
        const { collections, environments } = get();
        const collection = collections.find(c => c.id === collectionId);
        if (!collection?.environment_id) return undefined;
        return environments.find(e => e.id === collection.environment_id);
      },
      
      async activateEnvironmentForCollection(collectionId?: number) {
        const { environments } = get();
        
        if (!collectionId) {
          // No collection = deactivate all environments
          const activeEnv = environments.find(e => e.is_active);
          if (activeEnv) {
            await this.updateEnvironment(activeEnv.id, activeEnv.name, activeEnv.variables, false);
          }
          return;
        }
        
        const collectionEnv = this.getCollectionEnvironment(collectionId);
        const currentActiveEnv = this.getActiveEnvironment();
        
        // If collection has an environment and it's not already active
        if (collectionEnv && currentActiveEnv?.id !== collectionEnv.id) {
          // Deactivate current active environment
          if (currentActiveEnv) {
            await this.updateEnvironment(currentActiveEnv.id, currentActiveEnv.name, currentActiveEnv.variables, false);
          }
          // Activate collection's environment
          await this.updateEnvironment(collectionEnv.id, collectionEnv.name, collectionEnv.variables, true);
        }
      },
    }),
    { name: 'api-store' }
  )
);

// UI Store Implementation
export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        sidebarCollapsed: false,
        expandedFolders: new Set(),
        expandedCollections: new Set(),
        searchQuery: '',
        activeTab: 'params',
        responseTab: 'body',
        responseBodyTab: 'pretty',
        isExecutingRequest: false,
        unsavedChanges: false,
        
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        setActiveCollection: (id) => set({ activeCollection: id }),
        toggleFolderExpanded: (id) => set(state => {
          const newExpanded = new Set(state.expandedFolders);
          if (newExpanded.has(id)) {
            newExpanded.delete(id);
          } else {
            newExpanded.add(id);
          }
          return { expandedFolders: newExpanded };
        }),
        toggleCollectionExpanded: (id) => set(state => {
          const newExpanded = new Set(state.expandedCollections);
          if (newExpanded.has(id)) {
            newExpanded.delete(id);
          } else {
            newExpanded.add(id);
          }
          return { expandedCollections: newExpanded };
        }),
        setSearchQuery: (query) => set({ searchQuery: query }),
        setSelectedItem: (item) => set({ selectedItem: item }),
        
        setActiveRequest: (request) => set({ activeRequest: request, unsavedChanges: false }),
        setUnsavedChanges: (hasChanges) => set({ unsavedChanges: hasChanges }),
        setActiveTab: (tab) => set({ activeTab: tab }),
        
        setLastResponse: (response) => set({ lastResponse: response }),
        setResponseTab: (tab) => set({ responseTab: tab }),
        setResponseBodyTab: (tab) => set({ responseBodyTab: tab }),
        
        setIsExecutingRequest: (loading) => set({ isExecutingRequest: loading }),
        
        updateActiveRequestField: (field, value) => set(state => {
          if (!state.activeRequest) return state;
          return {
            activeRequest: { ...state.activeRequest, [field]: value },
            unsavedChanges: true,
          };
        }),
        
        updateActiveRequestHeaders: (headers) => set(state => {
          if (!state.activeRequest) return state;
          return {
            activeRequest: { 
              ...state.activeRequest, 
              headers: serializeHeaders(headers),
              parsedHeaders: headers,
            },
            unsavedChanges: true,
          };
        }),
        
        updateActiveRequestParams: (params) => set(state => {
          if (!state.activeRequest) return state;
          // Update URL with new params
          // This would be implemented based on the URL building logic
          return {
            activeRequest: { 
              ...state.activeRequest,
              params,
            },
            unsavedChanges: true,
          };
        }),
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          expandedFolders: Array.from(state.expandedFolders),
          expandedCollections: Array.from(state.expandedCollections),
          activeTab: state.activeTab,
          responseTab: state.responseTab,
          responseBodyTab: state.responseBodyTab,
        }),
        onRehydrateStorage: () => (state) => {
          if (state && Array.isArray(state.expandedFolders)) {
            state.expandedFolders = new Set(state.expandedFolders);
          }
          if (state && Array.isArray(state.expandedCollections)) {
            state.expandedCollections = new Set(state.expandedCollections);
          }
        },
      }
    ),
    { name: 'ui-store' }
  )
);

// Tabs Store Implementation
export const useTabsStore = create<TabsState>()(
  devtools(
    persist(
      (set, get) => ({
        tabs: [],
        activeTabId: undefined,
        
        openRequestTab: (request: Request) => {
          const { tabs } = get();
          
          // Check if tab for this request already exists
          const existingTab = tabs.find(
            tab => tab.type === 'request' && (tab as RequestTab).request.id === request.id
          );
          
          if (existingTab) {
            set({ activeTabId: existingTab.id });
            return existingTab.id;
          }
          
          // Create new tab
          const tabId = generateId();
          const newTab: RequestTab = {
            id: tabId,
            type: 'request',
            title: request.name || 'Untitled Request',
            request,
            unsavedChanges: false,
          };
          
          set(state => ({
            tabs: [...state.tabs, newTab],
            activeTabId: tabId,
          }));
          
          return tabId;
        },
        
        openCollectionTab: (collection: Collection) => {
          const { tabs } = get();
          
          // Check if tab for this collection already exists
          const existingTab = tabs.find(
            tab => tab.type === 'collection' && (tab as CollectionTab).collection.id === collection.id
          );
          
          if (existingTab) {
            set({ activeTabId: existingTab.id });
            return existingTab.id;
          }
          
          // Create new tab
          const tabId = generateId();
          const newTab: CollectionTab = {
            id: tabId,
            type: 'collection',
            title: collection.name,
            collection,
            folders: [], // Will be populated when needed
            requests: [], // Will be populated when needed
            unsavedChanges: false,
          };
          
          set(state => ({
            tabs: [...state.tabs, newTab],
            activeTabId: tabId,
          }));
          
          return tabId;
        },
        
        closeTab: (tabId: string) => {
          const { tabs, activeTabId } = get();
          const newTabs = tabs.filter(tab => tab.id !== tabId);
          
          let newActiveTabId = activeTabId;
          if (activeTabId === tabId) {
            // Find the next tab to activate
            const currentIndex = tabs.findIndex(tab => tab.id === tabId);
            if (newTabs.length > 0) {
              if (currentIndex > 0) {
                newActiveTabId = newTabs[currentIndex - 1].id;
              } else {
                newActiveTabId = newTabs[0].id;
              }
            } else {
              newActiveTabId = undefined;
            }
          }
          
          set({
            tabs: newTabs,
            activeTabId: newActiveTabId,
          });
        },
        
        setActiveTab: (tabId: string) => {
          set({ activeTabId: tabId });
        },
        
        updateTab: (tabId: string, updates: Partial<Tab>) => {
          set(state => ({
            tabs: state.tabs.map(tab => 
              tab.id === tabId ? { ...tab, ...updates } : tab
            ),
          }));
        },
        
        duplicateTab: (tabId: string) => {
          const { tabs } = get();
          const tab = tabs.find(t => t.id === tabId);
          
          if (!tab) return '';
          
          const newTabId = generateId();
          const newTab: Tab = {
            ...tab,
            id: newTabId,
            title: `${tab.title} (Copy)`,
            unsavedChanges: false,
          };
          
          set(state => ({
            tabs: [...state.tabs, newTab],
            activeTabId: newTabId,
          }));
          
          return newTabId;
        },
        
        pinTab: (tabId: string, pinned: boolean) => {
          set(state => ({
            tabs: state.tabs.map(tab => 
              tab.id === tabId ? { ...tab, pinned } : tab
            ),
          }));
        },
        
        closeAllTabs: () => {
          set({ tabs: [], activeTabId: undefined });
        },
        
        closeOtherTabs: (tabId: string) => {
          const { tabs } = get();
          const tab = tabs.find(t => t.id === tabId);
          
          if (tab) {
            set({
              tabs: [tab],
              activeTabId: tabId,
            });
          }
        },
        
        closeTabsToRight: (tabId: string) => {
          const { tabs } = get();
          const index = tabs.findIndex(t => t.id === tabId);
          
          if (index !== -1) {
            const newTabs = tabs.slice(0, index + 1);
            const isActiveTabRemoved = !newTabs.find(t => t.id === get().activeTabId);
            
            set({
              tabs: newTabs,
              activeTabId: isActiveTabRemoved ? tabId : get().activeTabId,
            });
          }
        },
        
        moveTab: (fromIndex: number, toIndex: number) => {
          const { tabs } = get();
          
          if (fromIndex < 0 || fromIndex >= tabs.length || toIndex < 0 || toIndex >= tabs.length) {
            return;
          }
          
          const newTabs = [...tabs];
          const [movedTab] = newTabs.splice(fromIndex, 1);
          newTabs.splice(toIndex, 0, movedTab);
          
          set({ tabs: newTabs });
        },
      }),
      {
        name: 'tabs-store',
        partialize: (state) => ({
          tabs: state.tabs.map(tab => ({
            ...tab,
            // Keep response data but reset isExecuting
            ...(tab.type === 'request' ? { isExecuting: false } : {}),
          })),
          activeTabId: state.activeTabId,
        }),
      }
    ),
    { name: 'tabs-store' }
  )
);