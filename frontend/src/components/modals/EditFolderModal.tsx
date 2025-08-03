import React from 'react';
import { X, Folder as FolderIcon, FolderPlus } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { useAPIStore } from '@/store';
import type { Folder, Collection } from '@/types';

interface EditFolderModalProps {
  folder?: Folder; // undefined = create mode
  collection: Collection;
  parentFolderId?: number;
  isOpen: boolean;
  onClose: () => void;
  onFolderSaved?: (folder: Folder) => void;
}

export const EditFolderModal: React.FC<EditFolderModalProps> = ({
  folder,
  collection,
  parentFolderId,
  isOpen,
  onClose,
  onFolderSaved,
}) => {
  const { folders, createFolder, updateFolder } = useAPIStore();
  const [name, setName] = React.useState(folder?.name || '');
  const [selectedParentId, setSelectedParentId] = React.useState(
    folder?.parent_folder_id || parentFolderId
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const isEditMode = !!folder;

  // Reset form when folder changes
  React.useEffect(() => {
    setName(folder?.name || '');
    setSelectedParentId(folder?.parent_folder_id || parentFolderId);
  }, [folder, parentFolderId]);

  // Get available parent folders (excluding self and descendants)
  const availableParentFolders = React.useMemo(() => {
    const collectionFolders = folders.filter(f => f.collection_id === collection.id);
    
    if (!isEditMode) {
      return collectionFolders;
    }

    // In edit mode, exclude self and descendants
    const getDescendantIds = (folderId: number): number[] => {
      const children = collectionFolders.filter(f => f.parent_folder_id === folderId);
      return [folderId, ...children.flatMap(child => getDescendantIds(child.id))];
    };

    const excludedIds = getDescendantIds(folder!.id);
    return collectionFolders.filter(f => !excludedIds.includes(f.id));
  }, [folders, collection.id, folder, isEditMode]);

  const parentFolderOptions = [
    { value: '', label: 'Root (No Parent)' },
    ...availableParentFolders.map(f => ({
      value: f.id.toString(),
      label: f.name,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      let savedFolder: Folder;
      
      if (isEditMode) {
        savedFolder = await updateFolder(
          folder!.id,
          name.trim(),
          collection.id,
          selectedParentId || undefined
        );
      } else {
        savedFolder = await createFolder(
          name.trim(),
          collection.id,
          selectedParentId || undefined
        );
      }
      
      onFolderSaved?.(savedFolder);
      onClose();
      setName('');
      setSelectedParentId(undefined);
    } catch (error) {
      console.error('Failed to save folder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              {isEditMode ? (
                <FolderIcon className="h-5 w-5 text-yellow-600" />
              ) : (
                <FolderPlus className="h-5 w-5 text-yellow-600" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditMode ? 'Edit Folder' : 'Create Folder'}
            </h2>
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
              Folder Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent Folder
            </label>
            <Select
              options={parentFolderOptions}
              value={selectedParentId?.toString() || ''}
              onChange={(value) => setSelectedParentId(value ? parseInt(value) : undefined)}
              placeholder="Select parent folder"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
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
              {isEditMode ? 'Update Folder' : 'Create Folder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};