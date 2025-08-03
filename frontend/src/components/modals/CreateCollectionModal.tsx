import React from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button, Input, Select } from '@/components/ui';
import { FolderOpen } from 'lucide-react';
import { useAPIStore } from '@/store';

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string, environmentId?: number) => Promise<void>;
}

export const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { environments } = useAPIStore();
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [environmentId, setEnvironmentId] = React.useState<number | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);

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
      await onSubmit(name.trim(), description.trim(), environmentId);
      handleClose();
    } catch (error) {
      console.error('Failed to create collection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setEnvironmentId(undefined);
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Collection"
      description="Collections help you organize your API requests"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex-shrink-0">
            <FolderOpen className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h3 className="font-medium text-blue-900">New Collection</h3>
            <p className="text-sm text-blue-700">
              Group related API requests together for better organization
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="collection-name" className="block text-sm font-medium text-gray-700 mb-2">
              Collection Name *
            </label>
            <Input
              id="collection-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My API, User Service, Payment API"
              className="w-full"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="collection-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <Input
              id="collection-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this collection"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="collection-environment" className="block text-sm font-medium text-gray-700 mb-2">
              Default Environment (optional)
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
            disabled={!name.trim() || isLoading}
          >
            Create Collection
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};