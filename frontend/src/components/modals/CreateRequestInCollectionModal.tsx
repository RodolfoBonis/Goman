import React from 'react';
import { X, FileText, Plus } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { useAPIStore, useTabsStore } from '@/store';
import { getMethodColor } from '@/utils';
import type { Collection, HTTPMethod } from '@/types';

interface CreateRequestInCollectionModalProps {
  collectionId?: number;
  folderId?: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, method: string, url: string, folderId?: number) => void;
}

const HTTP_METHODS: { value: HTTPMethod; label: string }[] = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'HEAD', label: 'HEAD' },
  { value: 'OPTIONS', label: 'OPTIONS' },
];

export const CreateRequestInCollectionModal: React.FC<CreateRequestInCollectionModalProps> = ({
  collectionId,
  folderId,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { folders, collections, createRequest } = useAPIStore();
  const { openRequestTab } = useTabsStore();
  const [name, setName] = React.useState('');
  const [method, setMethod] = React.useState<HTTPMethod>('GET');
  const [url, setUrl] = React.useState('');
  const [selectedFolderId, setSelectedFolderId] = React.useState(folderId);
  const [isLoading, setIsLoading] = React.useState(false);

  // Find the collection based on collectionId
  const collection = collections.find(c => c.id === collectionId);

  // Reset form when props change
  React.useEffect(() => {
    setName('');
    setMethod('GET');
    setUrl('');
    setSelectedFolderId(folderId);
  }, [collectionId, folderId, isOpen]);

  // Get available folders in this collection
  const collectionFolders = collection ? folders.filter(f => f.collection_id === collection.id) : [];
  
  const folderOptions = [
    { value: '', label: 'Root (No Folder)' },
    ...collectionFolders.map(f => ({
      value: f.id.toString(),
      label: f.name,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !collection) return;

    setIsLoading(true);
    try {
      // Use the onSubmit prop to handle the request creation
      await onSubmit(
        name.trim(),
        method,
        url.trim(),
        selectedFolderId || undefined
      );
      
      onClose();
      setName('');
      setMethod('GET');
      setUrl('');
      setSelectedFolderId(undefined);
    } catch (error) {
      console.error('Failed to create request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  
  // Don't render if collection is not found
  if (!collection) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Plus className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Create Request</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection
            </label>
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
              {collection.name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter request name"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HTTP Method
            </label>
            <Select
              options={HTTP_METHODS.map(m => ({
                ...m,
                label: (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getMethodColor(m.value).replace('text-', 'bg-')}`} />
                    {m.label}
                  </div>
                ),
              }))}
              value={method}
              onChange={(value) => setMethod(value as HTTPMethod)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL (Optional)
            </label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Folder
            </label>
            <Select
              options={folderOptions}
              value={selectedFolderId?.toString() || ''}
              onChange={(value) => setSelectedFolderId(value ? parseInt(value) : undefined)}
              placeholder="Select folder"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
            >
              Create Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};