import React from 'react';
import { X, FolderOpen } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { useAPIStore } from '@/store';
import { cn } from '@/utils';
import type { Collection } from '@/types';

interface EditCollectionModalProps {
  collection: Collection;
  isOpen: boolean;
  onClose: () => void;
  onCollectionUpdated?: (collection: Collection) => void;
}

export const EditCollectionModal: React.FC<EditCollectionModalProps> = ({
  collection,
  isOpen,
  onClose,
  onCollectionUpdated,
}) => {
  const { environments, updateCollection } = useAPIStore();
  const [name, setName] = React.useState(collection.name);
  const [description, setDescription] = React.useState(collection.description);
  const [environmentId, setEnvironmentId] = React.useState(collection.environment_id);
  const [isLoading, setIsLoading] = React.useState(false);

  // Reset form when collection changes
  React.useEffect(() => {
    setName(collection.name);
    setDescription(collection.description);
    setEnvironmentId(collection.environment_id);
  }, [collection]);

  const environmentOptions = [
    { value: '', label: 'No Environment' },
    ...environments.map(env => ({
      value: env.id.toString(),
      label: env.name,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const updatedCollection = await updateCollection(
        collection.id,
        name.trim(),
        description.trim(),
        environmentId || undefined
      );
      onCollectionUpdated?.(updatedCollection);
      onClose();
    } catch (error) {
      console.error('Failed to update collection:', error);
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
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Collection</h2>
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
              Collection Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter collection name"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter collection description"
              rows={3}
              className={cn(
                'w-full rounded-md border border-gray-200 px-3 py-2 text-sm',
                'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
                'resize-none'
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Environment
            </label>
            <Select
              options={environmentOptions}
              value={environmentId?.toString() || ''}
              onChange={(value) => setEnvironmentId(value ? parseInt(value) : undefined)}
              placeholder="Select default environment"
            />
            <p className="text-xs text-gray-500 mt-1">
              Requests in this collection will automatically use this environment
            </p>
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
              Update Collection
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};