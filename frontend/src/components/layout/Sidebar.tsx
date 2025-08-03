import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Plus, 
  FolderOpen, 
  Folder,
  MoreHorizontal,
  Edit3,
  Trash2,
  Copy,
  FileText,
} from 'lucide-react';
import { useAPIStore, useUIStore, useTabsStore } from '@/store';
import { Button, Input } from '@/components/ui';
import { CreateCollectionModal } from '@/components/modals/CreateCollectionModal';
import { CreateFolderModal } from '@/components/modals/CreateFolderModal';
import { CreateRequestModal } from '@/components/modals/CreateRequestModal';
import { CreateRequestInCollectionModal } from '@/components/modals/CreateRequestInCollectionModal';
import { EditFolderModal } from '@/components/modals/EditFolderModal';
import { SaveRequestModal } from '@/components/modals/SaveRequestModal';

import { getMethodColor, cn } from '@/utils';
import type { CollectionTreeItem, HTTPMethod } from '@/types';

export const Sidebar: React.FC = () => {
  const { 
    sidebarCollapsed, 
    searchQuery, 
    expandedFolders, 
    expandedCollections,
    selectedItem,
    setSidebarCollapsed, 
    setSearchQuery, 
    toggleFolderExpanded,
    toggleCollectionExpanded,
    setSelectedItem,
  } = useUIStore();

  const { 
    collections, 
    requests,
    folders,
    getCollectionTree,
    createCollection,
    createFolder,
    createRequest,
  } = useAPIStore();

  const { openRequestTab, openCollectionTab } = useTabsStore();

  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    item: CollectionTreeItem;
  } | null>(null);

  const [showCreateCollectionModal, setShowCreateCollectionModal] = React.useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = React.useState(false);
  const [showCreateRequestModal, setShowCreateRequestModal] = React.useState(false);
  const [showCreateRequestInCollectionModal, setShowCreateRequestInCollectionModal] = React.useState(false);
  const [showEditFolderModal, setShowEditFolderModal] = React.useState(false);
  const [showSaveRequestModal, setShowSaveRequestModal] = React.useState(false);
  
  const [dropdownOpen, setDropdownOpen] = React.useState<string | null>(null);
  const [editingItem, setEditingItem] = React.useState<CollectionTreeItem | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = React.useState<number | undefined>();
  const [selectedFolderId, setSelectedFolderId] = React.useState<number | undefined>();

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };
    
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownOpen]);

  const collectionTree = React.useMemo(() => {
    const tree = getCollectionTree();
    
    if (!searchQuery) return tree;
    
    // Filter tree based on search query
    const filterTree = (items: CollectionTreeItem[]): CollectionTreeItem[] => {
      return items.reduce((filtered: CollectionTreeItem[], item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const filteredChildren = item.children ? filterTree(item.children) : [];
        
        if (matchesSearch || filteredChildren.length > 0) {
          filtered.push({
            ...item,
            children: filteredChildren,
          });
        }
        
        return filtered;
      }, []);
    };
    
    return filterTree(tree);
  }, [getCollectionTree, searchQuery, collections, requests]);

  const handleItemClick = (item: CollectionTreeItem) => {
    setSelectedItem({ type: item.type, id: item.id });
    
    if (item.type === 'request') {
      const request = requests.find(r => r.id === item.id);
      if (request) {
        openRequestTab(request);
      }
    } else if (item.type === 'collection') {
      const collection = collections.find(c => c.id === item.id);
      if (collection) {
        openCollectionTab(collection);
      }
    } else if (item.type === 'folder') {
      toggleFolderExpanded(item.id);
    }
  };

  const handleContextMenu = (event: React.MouseEvent, item: CollectionTreeItem) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      item,
    });
  };

  const handleCreateCollection = async (name: string, description: string, environmentId?: number) => {
    await createCollection(name, description, environmentId);
  };

  const handleCreateFolder = async (name: string, collectionId: number, parentFolderId?: number) => {
    await createFolder(name, collectionId, parentFolderId);
  };

  const handleCreateRequest = async (name: string, method: any, url: string, collectionId?: number, folderId?: number) => {
    await createRequest(name, method, url, '{}', '', collectionId, folderId);
  };

  const handleSaveRequest = async (name: string, collectionId?: number, folderId?: number) => {
    // TODO: Implement saving current active request
    console.log('Save request:', { name, collectionId, folderId });
  };

  const handleDropdownAction = (action: string, item: CollectionTreeItem) => {
    setDropdownOpen(null);
    
    switch (action) {
      case 'createFolder':
        setSelectedCollectionId(item.type === 'collection' ? item.id : undefined);
        setSelectedFolderId(item.type === 'folder' ? item.id : undefined);
        setShowCreateFolderModal(true);
        break;
      case 'createRequest':
        setSelectedCollectionId(item.type === 'collection' ? item.id : undefined);
        setSelectedFolderId(item.type === 'folder' ? item.id : undefined);
        setShowCreateRequestInCollectionModal(true);
        break;
      case 'edit':
        setEditingItem(item);
        if (item.type === 'folder') {
          setShowEditFolderModal(true);
        }
        // TODO: Add edit for collection and request
        break;
      case 'duplicate':
        // TODO: Implement duplicate functionality
        console.log('Duplicate:', item);
        break;
      case 'delete':
        // TODO: Implement delete with confirmation
        console.log('Delete:', item);
        break;
    }
  };

  const handleCreateRequestInCollection = async (name: string, method: HTTPMethod, url: string, folderId?: number) => {
    if (selectedCollectionId) {
      const request = await createRequest(name, method, url, '{}', '', selectedCollectionId, folderId);
      // Open the new request in a tab
      openRequestTab(request);
    }
  };

  const renderTreeItem = (item: CollectionTreeItem, level = 0) => {
    const isSelected = selectedItem?.type === item.type && selectedItem?.id === item.id;
    const isExpanded = item.type === 'collection' 
      ? expandedCollections.has(item.id) 
      : expandedFolders.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    const paddingLeft = level * 16 + 12;

    return (
      <div key={`${item.type}-${item.id}`}>
        <div
          className={cn(
            'flex items-center gap-2 py-1.5 px-3 text-sm cursor-pointer transition-colors duration-150',
            'hover:bg-gray-100 group',
            isSelected ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500' : 'text-gray-700'
          )}
          style={{ paddingLeft }}
          onClick={() => handleItemClick(item)}
          onContextMenu={(e) => handleContextMenu(e, item)}
        >
          {/* Expand/Collapse Icon */}
          {(item.type === 'collection' || item.type === 'folder') && hasChildren && (
            <button
              className="flex-shrink-0 p-0.5 hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (item.type === 'collection') {
                  toggleCollectionExpanded(item.id);
                } else {
                  toggleFolderExpanded(item.id);
                }
              }}
            >
              {isExpanded ? (
                <ChevronRight className="h-3 w-3 transform rotate-90 transition-transform" />
              ) : (
                <ChevronRight className="h-3 w-3 transition-transform" />
              )}
            </button>
          )}

          {/* Icon */}
          <div className="flex-shrink-0">
            {item.type === 'collection' && (
              <FolderOpen className="h-4 w-4 text-blue-500" />
            )}
            {item.type === 'folder' && (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-yellow-500" />
              ) : (
                <Folder className="h-4 w-4 text-yellow-500" />
              )
            )}
            {item.type === 'request' && (
              <div className={cn(
                'px-1.5 py-0.5 rounded text-xs font-medium',
                getMethodColor(item.method!)
              )}>
                {item.method}
              </div>
            )}
          </div>

          {/* Name */}
          <span className="flex-1 truncate text-sm">
            {item.name}
          </span>

          {/* Actions */}
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity relative">
            <button 
              className="p-1 hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(dropdownOpen === `${item.type}-${item.id}` ? null : `${item.type}-${item.id}`);
              }}
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>
            
            {/* Dropdown Menu */}
            {dropdownOpen === `${item.type}-${item.id}` && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-[100]">
                <div className="py-1">
                  {item.type === 'collection' && (
                    <>
                      <button
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleDropdownAction('createFolder', item)}
                      >
                        <Folder className="h-4 w-4 mr-2" />
                        Create Folder
                      </button>
                      <button
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleDropdownAction('createRequest', item)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Create Request
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleDropdownAction('edit', item)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Collection
                      </button>
                    </>
                  )}
                  
                  {item.type === 'folder' && (
                    <>
                      <button
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleDropdownAction('createFolder', item)}
                      >
                        <Folder className="h-4 w-4 mr-2" />
                        Create Subfolder
                      </button>
                      <button
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleDropdownAction('createRequest', item)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Create Request
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleDropdownAction('edit', item)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Folder
                      </button>
                      <button
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleDropdownAction('delete', item)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Folder
                      </button>
                    </>
                  )}
                  
                  {item.type === 'request' && (
                    <>
                      <button
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleDropdownAction('duplicate', item)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate Request
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleDropdownAction('edit', item)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Request
                      </button>
                      <button
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                        onClick={() => handleDropdownAction('delete', item)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Request
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {item.type === 'folder' && isExpanded && hasChildren && (
          <div>
            {item.children!.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}

        {/* Collection children (only visible when expanded) */}
        {item.type === 'collection' && isExpanded && hasChildren && (
          <div>
            {item.children!.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={cn(
        'fixed left-0 top-12 h-[calc(100vh-3rem)] bg-white border-r border-gray-200 transition-all duration-300 z-30',
        sidebarCollapsed ? 'w-16' : 'w-80'
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900">Collections</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Plus className="h-4 w-4" />}
                  className="!p-1"
                  onClick={() => setShowCreateCollectionModal(true)}
                >
                  {!sidebarCollapsed && 'New'}
                </Button>
              </div>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              icon={sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="!p-2"
            />
          </div>

          {/* Search */}
          {!sidebarCollapsed && (
            <div className="mt-3">
              <Input
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Collections Tree */}
        <div className="flex-1 overflow-y-auto pb-4 h-full">
          {!sidebarCollapsed ? (
            <div className="py-2">
              {collectionTree.length > 0 ? (
                collectionTree.map(item => renderTreeItem(item))
              ) : searchQuery ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No results found</p>
                  <p className="text-xs">Try a different search term</p>
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No collections yet</p>
                  <p className="text-xs">Create your first collection to get started</p>
                </div>
              )}
            </div>
          ) : (
            /* Collapsed sidebar - just icons */
            <div className="py-2 space-y-1">
              {collections.slice(0, 8).map((collection, index) => (
                <div
                  key={collection.id}
                  className="mx-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                  title={collection.name}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">
                      {collection.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-large py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onBlur={() => setContextMenu(null)}
        >
          {contextMenu.item.type === 'collection' && (
            <>
              <button 
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                onClick={() => {
                  setShowCreateFolderModal(true);
                  setContextMenu(null);
                }}
              >
                Add Folder
              </button>
              <button 
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                onClick={() => {
                  setShowCreateRequestModal(true);
                  setContextMenu(null);
                }}
              >
                Add Request
              </button>
              <div className="border-t border-gray-200 my-1"></div>
            </>
          )}
          {contextMenu.item.type === 'folder' && (
            <>
              <button 
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                onClick={() => {
                  setShowCreateRequestModal(true);
                  setContextMenu(null);
                }}
              >
                Add Request
              </button>
              <div className="border-t border-gray-200 my-1"></div>
            </>
          )}
          <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
            Rename
          </button>
          <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100">
            Duplicate
          </button>
          <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600">
            Delete
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateCollectionModal
        isOpen={showCreateCollectionModal}
        onClose={() => setShowCreateCollectionModal(false)}
        onSubmit={handleCreateCollection}
      />

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onSubmit={handleCreateFolder}
      />

      <CreateRequestModal
        isOpen={showCreateRequestModal}
        onClose={() => setShowCreateRequestModal(false)}
        onSubmit={handleCreateRequest}
      />

      <SaveRequestModal
        isOpen={showSaveRequestModal}
        onClose={() => setShowSaveRequestModal(false)}
        onSubmit={handleSaveRequest}
      />

      <CreateRequestInCollectionModal
        isOpen={showCreateRequestInCollectionModal}
        onClose={() => {
          setShowCreateRequestInCollectionModal(false);
          setSelectedCollectionId(undefined);
          setSelectedFolderId(undefined);
        }}
        onSubmit={handleCreateRequestInCollection}
        collectionId={selectedCollectionId}
        folderId={selectedFolderId}
      />

      {editingItem?.type === 'folder' && (() => {
        const folderData = folders.find(f => f.id === editingItem.id);
        const collection = folderData ? collections.find(c => c.id === folderData.collection_id) : undefined;
        
        if (!collection) {
          return null; // Don't render modal if collection not found
        }
        
        return (
          <EditFolderModal
            isOpen={showEditFolderModal}
            onClose={() => {
              setShowEditFolderModal(false);
              setEditingItem(null);
            }}
            onFolderSaved={() => {
              setShowEditFolderModal(false);
              setEditingItem(null);
            }}
            collection={collection}
            folder={folderData}
          />
        );
      })()}
    </>
  );
};