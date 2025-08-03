import React from 'react';
import { 
  FolderOpen, 
  FileText, 
  Plus, 
  Search,
  Edit,
  Trash2,
  Calendar,
  BarChart3,
  Tag,
  MoreVertical,
  FolderPlus,
  Globe
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { EditCollectionModal } from '@/components/modals/EditCollectionModal';
import { EditFolderModal } from '@/components/modals/EditFolderModal';
import { CreateRequestInCollectionModal } from '@/components/modals/CreateRequestInCollectionModal';
import { useAPIStore, useTabsStore } from '@/store';
import { cn, getMethodColor, formatRelativeTime } from '@/utils';
import type { Collection, Folder, Request } from '@/types';

interface CollectionDetailsViewProps {
  collection: Collection;
  className?: string;
}

export const CollectionDetailsView: React.FC<CollectionDetailsViewProps> = ({
  collection,
  className,
}) => {
  const { folders, requests, environments, deleteFolder, deleteRequest } = useAPIStore();
  const { openRequestTab } = useTabsStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showFolders, setShowFolders] = React.useState(true);
  const [showRequests, setShowRequests] = React.useState(true);
  
  // Modal states
  const [showEditCollection, setShowEditCollection] = React.useState(false);
  const [showEditFolder, setShowEditFolder] = React.useState(false);
  const [showCreateRequest, setShowCreateRequest] = React.useState(false);
  const [editingFolder, setEditingFolder] = React.useState<Folder | undefined>();
  const [selectedFolderId, setSelectedFolderId] = React.useState<number | undefined>();

  // Get collection's folders and requests
  const collectionFolders = folders.filter(f => f.collection_id === collection.id);
  const collectionRequests = requests.filter(r => r.collection_id === collection.id);

  // Filter by search query
  const filteredFolders = collectionFolders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredRequests = collectionRequests.filter(request =>
    request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group requests by method for stats
  const requestsByMethod = React.useMemo(() => {
    const groups: Record<string, number> = {};
    collectionRequests.forEach(request => {
      groups[request.method] = (groups[request.method] || 0) + 1;
    });
    return groups;
  }, [collectionRequests]);

  const handleRequestClick = (request: Request) => {
    openRequestTab(request);
  };

  // Get collection's linked environment
  const linkedEnvironment = environments.find(e => e.id === collection.environment_id);

  // Modal handlers
  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setShowEditFolder(true);
  };

  const handleCreateFolder = (parentFolderId?: number) => {
    setEditingFolder(undefined);
    setSelectedFolderId(parentFolderId);
    setShowEditFolder(true);
  };

  const handleCreateRequest = (folderId?: number) => {
    setSelectedFolderId(folderId);
    setShowCreateRequest(true);
  };

  const handleDeleteFolder = async (folder: Folder) => {
    if (confirm(`Are you sure you want to delete the folder "${folder.name}"? This will also delete all requests inside it.`)) {
      try {
        await deleteFolder(folder.id);
      } catch (error) {
        console.error('Failed to delete folder:', error);
      }
    }
  };

  const handleDeleteRequest = async (request: Request) => {
    if (confirm(`Are you sure you want to delete the request "${request.name}"?`)) {
      try {
        await deleteRequest(request.id);
      } catch (error) {
        console.error('Failed to delete request:', error);
      }
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{collection.name}</h1>
                <p className="text-sm text-gray-500">
                  Created {formatRelativeTime(collection.created_at)}
                </p>
              </div>
            </div>
            {collection.description && (
              <p className="text-gray-600 mt-2">{collection.description}</p>
            )}
            
            {/* Linked Environment */}
            {linkedEnvironment && (
              <div className="flex items-center gap-2 mt-3">
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">
                  Environment: <span className="font-medium text-blue-600">{linkedEnvironment.name}</span>
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowEditCollection(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleCreateFolder()}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Add Folder
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleCreateRequest()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Request
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{collectionRequests.length}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Folders</p>
                <p className="text-2xl font-bold text-gray-900">{collectionFolders.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatRelativeTime(collection.updated_at)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Methods</p>
                <div className="flex gap-1 mt-1">
                  {Object.entries(requestsByMethod).map(([method, count]) => (
                    <span
                      key={method}
                      className={cn(
                        'text-xs px-2 py-1 rounded',
                        getMethodColor(method as any).replace('text-', 'bg-').replace('600', '100'),
                        getMethodColor(method as any).replace('600', '700')
                      )}
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests and folders..."
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFolders(!showFolders)}
              className={cn(
                'px-3 py-2 text-sm rounded border transition-colors',
                showFolders 
                  ? 'bg-blue-100 border-blue-300 text-blue-700' 
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              )}
            >
              <FolderOpen className="h-4 w-4 mr-2 inline" />
              Folders
            </button>
            
            <button
              onClick={() => setShowRequests(!showRequests)}
              className={cn(
                'px-3 py-2 text-sm rounded border transition-colors',
                showRequests 
                  ? 'bg-blue-100 border-blue-300 text-blue-700' 
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              )}
            >
              <FileText className="h-4 w-4 mr-2 inline" />
              Requests
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Folders Section */}
        {showFolders && filteredFolders.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Folders ({filteredFolders.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFolders.map((folder) => (
                <div
                  key={folder.id}
                  className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
                        <FolderOpen className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{folder.name}</h4>
                        <p className="text-sm text-gray-500">
                          {requests.filter(r => r.folder_id === folder.id).length} requests
                        </p>
                      </div>
                    </div>
                    
                    {/* Folder Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateRequest(folder.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Add Request"
                      >
                        <Plus className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateFolder(folder.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Add Subfolder"
                      >
                        <FolderPlus className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFolder(folder);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit Folder"
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete Folder"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requests Section */}
        {showRequests && filteredRequests.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Requests ({filteredRequests.length})
            </h3>
            <div className="space-y-2">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleRequestClick(request)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded',
                        getMethodColor(request.method).replace('text-', 'bg-').replace('600', '100'),
                        getMethodColor(request.method).replace('600', '700')
                      )}>
                        {request.method}
                      </span>
                      
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 truncate">{request.name}</h4>
                        <p className="text-sm text-gray-500 truncate">{request.url}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-400">
                        {formatRelativeTime(request.updated_at)}
                      </div>
                      
                      {/* Request Actions */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRequest(request);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                        title="Delete Request"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {searchQuery && filteredFolders.length === 0 && filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">Try adjusting your search query</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditCollectionModal
        collection={collection}
        isOpen={showEditCollection}
        onClose={() => setShowEditCollection(false)}
        onCollectionUpdated={() => {
          // The collection will be updated via the store automatically
        }}
      />

      <EditFolderModal
        folder={editingFolder}
        collection={collection}
        parentFolderId={selectedFolderId}
        isOpen={showEditFolder}
        onClose={() => {
          setShowEditFolder(false);
          setEditingFolder(undefined);
          setSelectedFolderId(undefined);
        }}
        onFolderSaved={() => {
          // The folder will be updated via the store automatically
        }}
      />

      <CreateRequestInCollectionModal
        collection={collection}
        folderId={selectedFolderId}
        isOpen={showCreateRequest}
        onClose={() => {
          setShowCreateRequest(false);
          setSelectedFolderId(undefined);
        }}
      />
    </div>
  );
};