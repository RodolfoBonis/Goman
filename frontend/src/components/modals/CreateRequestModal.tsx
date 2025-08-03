import React from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button, Input, Select } from '@/components/ui';
import { FileText } from 'lucide-react';
import { useAPIStore } from '@/store';
import type { HTTPMethod } from '@/types';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, method: HTTPMethod, url: string, collectionId?: number, folderId?: number) => Promise<void>;
}

const HTTP_METHODS: HTTPMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { collections, folders } = useAPIStore();
  const [name, setName] = React.useState('');
  const [method, setMethod] = React.useState<HTTPMethod>('GET');
  const [url, setUrl] = React.useState('');
  const [collectionId, setCollectionId] = React.useState<number | ''>('');
  const [folderId, setFolderId] = React.useState<number | ''>('');
  const [isLoading, setIsLoading] = React.useState(false);

  const availableFolders = React.useMemo(() => {
    if (!collectionId) return [];
    return folders.filter(f => f.collection_id === collectionId);
  }, [folders, collectionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !url.trim()) return;
    
    setIsLoading(true);
    try {
      await onSubmit(
        name.trim(),
        method,
        url.trim(),
        collectionId ? Number(collectionId) : undefined,
        folderId ? Number(folderId) : undefined
      );
      handleClose();
    } catch (error) {
      console.error('Failed to create request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setMethod('GET');
    setUrl('');
    setCollectionId('');
    setFolderId('');
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Request"
      description="Create a new HTTP request"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
          <div className="flex-shrink-0">
            <FileText className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <h3 className="font-medium text-green-900">New Request</h3>
            <p className="text-sm text-green-700">
              Create an HTTP request and organize it in your collections
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="request-name" className="block text-sm font-medium text-gray-700 mb-2">
              Request Name *
            </label>
            <Input
              id="request-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Get Users, Create Post, Login"
              className="w-full"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="request-method" className="block text-sm font-medium text-gray-700 mb-2">
                Method *
              </label>
              <Select
                id="request-method"
                value={method}
                onChange={(e) => setMethod(e.target.value as HTTPMethod)}
                className="w-full"
                required
              >
                {HTTP_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </div>

            <div>
              <label htmlFor="request-url" className="block text-sm font-medium text-gray-700 mb-2">
                URL *
              </label>
              <Input
                id="request-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/endpoint"
                className="w-full"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="request-collection" className="block text-sm font-medium text-gray-700 mb-2">
              Collection (optional)
            </label>
            <Select
              id="request-collection"
              value={collectionId}
              onChange={(e) => {
                setCollectionId(e.target.value ? Number(e.target.value) : '');
                setFolderId(''); // Reset folder when collection changes
              }}
              className="w-full"
            >
              <option value="">No collection (unsaved request)</option>
              {collections.map(collection => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </Select>
          </div>

          {availableFolders.length > 0 && collectionId && (
            <div>
              <label htmlFor="request-folder" className="block text-sm font-medium text-gray-700 mb-2">
                Folder (optional)
              </label>
              <Select
                id="request-folder"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value ? Number(e.target.value) : '')}
                className="w-full"
              >
                <option value="">Root of collection</option>
                {availableFolders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {!collectionId && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Tip:</strong> If you don't select a collection, this will create an unsaved request that you can work on and save later.
              </p>
            </div>
          )}
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={!name.trim() || !url.trim() || isLoading}
          >
            Create Request
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};