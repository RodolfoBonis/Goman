import React from 'react';
import { 
  Globe, 
  Settings, 
  Download, 
  Upload, 
  Play,
  Save,
  Copy,
  Plus,
  FileText,
} from 'lucide-react';
import { Button, Select } from '@/components/ui';
import { useAPIStore, useUIStore } from '@/store';
import { EnvironmentsListModal } from '@/components/modals/EnvironmentsListModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { ImportExportModal } from '@/components/modals/ImportExportModal';
import { DocumentationModal } from '@/components/modals/DocumentationModal';
import { BulkOperationsModal } from '@/components/modals/BulkOperationsModal';
import { cn } from '@/utils';

interface TopBarProps {
  onNewRequest?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onNewRequest }) => {
  const { environments, getActiveEnvironment, updateEnvironment, fetchEnvironments } = useAPIStore();
  const { activeRequest, unsavedChanges, isExecutingRequest } = useUIStore();
  
  const [showEnvironmentsModal, setShowEnvironmentsModal] = React.useState(false);
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [showImportExportModal, setShowImportExportModal] = React.useState(false);
  const [showDocumentationModal, setShowDocumentationModal] = React.useState(false);
  const [showBulkOperationsModal, setShowBulkOperationsModal] = React.useState(false);
  
  const activeEnvironment = React.useMemo(() => getActiveEnvironment(), [environments]);

  const environmentOptions = React.useMemo(() => [
    { value: '', label: 'No Environment' },
    ...environments.map(env => ({
      value: env.id.toString(),
      label: env.name,
    })),
  ], [environments]);

  // Fetch environments on mount
  React.useEffect(() => {
    fetchEnvironments();
  }, [fetchEnvironments]);

  const handleSendRequest = () => {
    if (activeRequest && !isExecutingRequest) {
      // TODO: Implement request sending
      console.log('Sending request...');
    }
  };

  const handleSaveRequest = () => {
    if (activeRequest) {
      // TODO: Show save modal or implement auto-save
      console.log('Saving request...', activeRequest);
    }
  };

  const handleEnvironmentChange = async (environmentId: string) => {
    try {
      // First, deactivate all environments
      for (const env of environments) {
        if (env.is_active) {
          await updateEnvironment(env.id, env.name, env.variables, false);
        }
      }

      // Then activate the selected environment (if not empty)
      if (environmentId) {
        const selectedEnv = environments.find(env => env.id.toString() === environmentId);
        if (selectedEnv) {
          await updateEnvironment(selectedEnv.id, selectedEnv.name, selectedEnv.variables, true);
        }
      }
    } catch (error) {
      console.error('Failed to change environment:', error);
      // TODO: Show error toast
    }
  };

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
      {/* Left Section - App Title */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img 
              src="/appicon.png" 
              alt="GoMan" 
              className="w-8 h-8 rounded-lg"
            />
          </div>
          <h1 className="font-semibold text-gray-900">GoMan</h1>
        </div>

        {/* New Request Button */}
        <Button
          size="sm"
          variant="secondary"
          icon={<Plus className="h-4 w-4" />}
          onClick={onNewRequest}
          className="!px-4"
        >
          New Request
        </Button>
        
        {/* Quick Actions */}
        {activeRequest && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              loading={isExecutingRequest}
              icon={<Play className="h-4 w-4" />}
              onClick={handleSendRequest}
              className="!px-6"
            >
              Send
            </Button>
            
            {unsavedChanges && (
              <Button
                size="sm"
                variant="secondary"
                icon={<Save className="h-4 w-4" />}
                onClick={handleSaveRequest}
              >
                Save
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              icon={<Copy className="h-4 w-4" />}
              title="Duplicate Request"
            />
            
            <Button
              size="sm"
              variant="ghost"
              icon={<Upload className="h-4 w-4" />}
              onClick={() => setShowImportExportModal(true)}
              title="Import/Export Collections"
            />
            <Button
              size="sm"
              variant="ghost"
              icon={<FileText className="h-4 w-4" />}
              onClick={() => setShowDocumentationModal(true)}
              title="Generate Documentation"
            />
            
            <Button
              size="sm"
              variant="ghost"
              icon={<Play className="h-4 w-4" />}
              onClick={() => setShowBulkOperationsModal(true)}
              title="Bulk Operations"
            />
          </div>
        )}
      </div>

      {/* Center Section - Environment Selector */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600 whitespace-nowrap">Environment:</span>
          <div className="w-40">
            <Select
              options={environmentOptions}
              value={activeEnvironment?.id.toString() || ''}
              placeholder="Select environment"
              onChange={handleEnvironmentChange}
            />
          </div>
          <Button
            size="sm"
            variant="ghost"
            icon={<Settings className="h-4 w-4" />}
            onClick={() => setShowEnvironmentsModal(true)}
            title="Manage Environments"
          />
        </div>
      </div>

      {/* Right Section - Tools */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          icon={<Upload className="h-4 w-4" />}
          title="Import Collection"
        />
        
        <Button
          size="sm"
          variant="ghost"
          icon={<Download className="h-4 w-4" />}
          title="Export Collection"
        />
        
        <div className="w-px h-6 bg-gray-200" />
        
        <Button
          size="sm"
          variant="ghost"
          icon={<Settings className="h-4 w-4" />}
          onClick={() => setShowSettingsModal(true)}
          title="Settings"
        />
      </div>

      {/* Environments Modal */}
      <EnvironmentsListModal
        isOpen={showEnvironmentsModal}
        onClose={() => setShowEnvironmentsModal(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      <ImportExportModal
        isOpen={showImportExportModal}
        onClose={() => setShowImportExportModal(false)}
      />
      <DocumentationModal
        isOpen={showDocumentationModal}
        onClose={() => setShowDocumentationModal(false)}
      />

      <BulkOperationsModal
        isOpen={showBulkOperationsModal}
        onClose={() => setShowBulkOperationsModal(false)}
        selectedRequests={[]} // TODO: Get selected requests from store
      />
    </div>
  );
};