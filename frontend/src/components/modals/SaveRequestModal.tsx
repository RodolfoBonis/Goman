import React from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button, Input, Select } from '@/components/ui';
import { Save } from 'lucide-react';
import { useAPIStore } from '@/store';
import type { Request } from '@/types';

interface SaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, collectionId?: number, folderId?: number) => Promise<void>;
  request?: Request;
}

export const SaveRequestModal: React.FC<SaveRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  request,
}) => {
  const { collections, folders } = useAPIStore();
  const [name, setName] = React.useState('');
  const [collectionId, setCollectionId] = React.useState<number | ''>('');
  const [folderId, setFolderId] = React.useState<number | ''>('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (request && isOpen) {
      setName(request.name || `${request.method} Request`);
    }
  }, [request, isOpen]);

  const availableFolders = React.useMemo(() => {
    if (!collectionId) return [];
    return folders.filter(f => f.collection_id === collectionId);
  }, [folders, collectionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    setIsLoading(true);
    try {
      await onSubmit(
        name.trim(),
        collectionId ? Number(collectionId) : undefined,
        folderId ? Number(folderId) : undefined
      );
      handleClose();
    } catch (error) {
      console.error('Failed to save request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setCollectionId('');
    setFolderId('');
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Save Request"
      description="Choose where to save this request"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
          <div className="flex-shrink-0">
            <Save className="h-8 w-8 text-purple-500" />
          </div>
          <div>
            <h3 className="font-medium text-purple-900">Save Request</h3>
            <p className="text-sm text-purple-700">
              Save this request to a collection for future use
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="save-name" className="block text-sm font-medium text-gray-700 mb-2">
              Request Name *
            </label>
            <Input
              id="save-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Get Users, Create Post, Login"
              className="w-full"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="save-collection" className="block text-sm font-medium text-gray-700 mb-2">
              Collection *
            </label>
            <Select
              id="save-collection"
              value={collectionId}
              onChange={(e) => {
                setCollectionId(e.target.value ? Number(e.target.value) : '');
                setFolderId(''); // Reset folder when collection changes
              }}
              className="w-full"
              required
            >
              <option value="">Select a collection</option>
              {collections.map(collection => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </Select>
          </div>

          {availableFolders.length > 0 && collectionId && (
            <div>
              <label htmlFor="save-folder" className="block text-sm font-medium text-gray-700 mb-2">
                Folder (optional)
              </label>
              <Select
                id="save-folder"
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

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Current request:</strong> {request?.method} {request?.url}
            </p>
          </div>
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
            disabled={!name.trim() || !collectionId || isLoading}
          >
            Save Request
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};