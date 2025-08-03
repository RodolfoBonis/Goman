// HTTP Methods
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// Auth Types
export type AuthType = 'none' | 'bearer' | 'basic' | 'api-key';

export interface Auth {
  type: AuthType;
  token?: string;
  username?: string;
  password?: string;
  key?: string;
  value?: string;
  addTo?: 'header' | 'query';
}

// Request Body Types
export type BodyType = 'none' | 'json' | 'xml' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary';

export interface KeyValue {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface FormDataItem extends KeyValue {
  type: 'text' | 'file';
  file?: File;
}

// Core Data Models
export interface Collection {
  id: number;
  name: string;
  description: string;
  environment_id?: number; // Linked environment
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: number;
  name: string;
  collection_id: number;
  parent_folder_id?: number;
  created_at: string;
}

export interface Request {
  id: number;
  name: string;
  method: HTTPMethod;
  url: string;
  headers: string; // JSON string
  body: string;
  collection_id?: number;
  folder_id?: number;
  created_at: string;
  updated_at: string;
  // Parsed fields for UI
  parsedHeaders?: KeyValue[];
  parsedBody?: any;
  auth?: Auth;
  params?: KeyValue[];
  bodyType?: BodyType;
}

export interface Environment {
  id: number;
  name: string;
  variables: string; // JSON string
  is_active: boolean;
  created_at: string;
  // Parsed fields for UI
  parsedVariables?: KeyValue[];
}

export interface RequestHistory {
  id: number;
  request_id: number;
  response_status: number;
  response_time: number;
  response_body: string;
  response_headers: string; // JSON string
  executed_at: string;
}

// Response Types
export interface APIResponse {
  status: number;
  statusText: string;
  headers: string;
  body: string;
  responseTime: number;
  contentType: string;
}

// UI State Types
export interface RequestBuilderState {
  activeRequest?: Request;
  isLoading: boolean;
  lastResponse?: APIResponse;
  activeTab: 'params' | 'auth' | 'headers' | 'body' | 'tests';
  bodyTab: 'pretty' | 'raw' | 'preview';
}

export interface SidebarState {
  activeCollection?: number;
  expandedFolders: Set<number>;
  searchQuery: string;
  selectedItem?: {
    type: 'collection' | 'folder' | 'request';
    id: number;
  };
}

// Error Types
export interface APIError {
  message: string;
  code?: string;
  details?: unknown;
}

// Theme and UI
export interface Theme {
  mode: 'light' | 'dark';
  primary: string;
  background: string;
  surface: string;
  text: string;
}

// Collection Tree Types (for sidebar)
export interface CollectionTreeItem {
  id: number;
  name: string;
  type: 'collection' | 'folder' | 'request';
  children?: CollectionTreeItem[];
  collection_id?: number;
  parent_folder_id?: number;
  method?: HTTPMethod;
}

// Import/Export Types
export interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    schema: string;
  };
  item: PostmanItem[];
}

export interface PostmanItem {
  name: string;
  request?: {
    method: string;
    header?: Array<{ key: string; value: string; type: string }>;
    url: string | { raw: string; host: string[]; path: string[] };
    body?: {
      mode: string;
      raw?: string;
      formdata?: Array<{ key: string; value: string; type: string }>;
    };
  };
  item?: PostmanItem[]; // For folders
}

// Tab System Types
export type TabType = 'request' | 'collection';

export interface BaseTab {
  id: string;
  type: TabType;
  title: string;
  unsavedChanges: boolean;
  pinned?: boolean;
}

export interface RequestTab extends BaseTab {
  type: 'request';
  request: Request;
  response?: APIResponse;
  isExecuting?: boolean;
}

export interface CollectionTab extends BaseTab {
  type: 'collection';
  collection: Collection;
  folders: Folder[];
  requests: Request[];
}

export type Tab = RequestTab | CollectionTab;

export interface TabsState {
  tabs: Tab[];
  activeTabId?: string;
  
  // Actions
  openRequestTab: (request: Request) => string;
  openCollectionTab: (collection: Collection) => string;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
  duplicateTab: (tabId: string) => string;
  pinTab: (tabId: string, pinned: boolean) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (tabId: string) => void;
  closeTabsToRight: (tabId: string) => void;
  moveTab: (fromIndex: number, toIndex: number) => void;
}

// App Settings
export interface AppSettings {
  theme: Theme;
  autoSave: boolean;
  requestTimeout: number;
  followRedirects: boolean;
  validateSSL: boolean;
  shortcuts: Record<string, string>;
}