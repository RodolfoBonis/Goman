import React from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button, Input, Select } from '@/components/ui';
import { Folder } from 'lucide-react';
import { useAPIStore } from '@/store';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, collectionId: number, parentFolderId?: number) => Promise<void>;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { collections, folders } = useAPIStore();
  const [name, setName] = React.useState('');
  const [collectionId, setCollectionId] = React.useState<number | ''>('');
  const [parentFolderId, setParentFolderId] = React.useState<number | ''>('');
  const [isLoading, setIsLoading] = React.useState(false);

  const availableFolders = React.useMemo(() => {
    if (!collectionId) return [];
    return folders.filter(f => f.collection_id === collectionId);
  }, [folders, collectionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !collectionId) return;
    
    setIsLoading(true);
    try {
      await onSubmit(
        name.trim(), 
        Number(collectionId), 
        parentFolderId ? Number(parentFolderId) : undefined
      );
      handleClose();
    } catch (error) {
      console.error('Failed to create folder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setCollectionId('');
    setParentFolderId('');
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Folder"
      description="Organize your requests with folders"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
          <div className="flex-shrink-0">
            <Folder className="h-8 w-8 text-yellow-500" />
          </div>
          <div>
            <h3 className="font-medium text-yellow-900">New Folder</h3>
            <p className="text-sm text-yellow-700">
              Create folders to organize requests within collections
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 mb-2">
              Folder Name *
            </label>
            <Input
              id="folder-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Authentication, Users, Products"
              className="w-full"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="collection-select" className="block text-sm font-medium text-gray-700 mb-2">
              Collection *
            </label>
            <Select
              id="collection-select"
              value={collectionId}
              onChange={(e) => {
                setCollectionId(e.target.value ? Number(e.target.value) : '');
                setParentFolderId(''); // Reset parent folder when collection changes
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

          {availableFolders.length > 0 && (
            <div>
              <label htmlFor="parent-folder-select" className="block text-sm font-medium text-gray-700 mb-2">
                Parent Folder (optional)
              </label>
              <Select
                id="parent-folder-select"
                value={parentFolderId}
                onChange={(e) => setParentFolderId(e.target.value ? Number(e.target.value) : '')}
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
            Create Folder
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};