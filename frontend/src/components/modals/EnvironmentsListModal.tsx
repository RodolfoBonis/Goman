import React from 'react';
import { Plus, Settings, Check, Globe, HelpCircle } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { EnvironmentVariablesGuide } from '@/components/ui/EnvironmentVariablesGuide';
import { useAPIStore } from '@/store';
import { EnvironmentModal } from './EnvironmentModal';
import { formatDate, cn } from '@/utils';
import type { Environment } from '@/types';

interface EnvironmentsListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnvironmentsListModal: React.FC<EnvironmentsListModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { environments, updateEnvironment, fetchEnvironments } = useAPIStore();
  
  const [selectedEnvironment, setSelectedEnvironment] = React.useState<Environment | null>(null);
  const [showEnvironmentModal, setShowEnvironmentModal] = React.useState(false);
  const [showGuide, setShowGuide] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

  // Fetch environments when modal opens
  React.useEffect(() => {
    if (isOpen) {
      fetchEnvironments();
    }
  }, [isOpen, fetchEnvironments]);

  const handleCreateNew = () => {
    setSelectedEnvironment(null);
    setIsCreating(true);
    setShowEnvironmentModal(true);
  };

  const handleEditEnvironment = (environment: Environment) => {
    setSelectedEnvironment(environment);
    setIsCreating(false);
    setShowEnvironmentModal(true);
  };

  const handleSetActive = async (environment: Environment) => {
    try {
      await updateEnvironment(
        environment.id,
        environment.name,
        environment.variables,
        !environment.is_active
      );
    } catch (error) {
      console.error('Failed to update environment:', error);
      // TODO: Show error toast
    }
  };

  const handleEnvironmentModalClose = () => {
    setShowEnvironmentModal(false);
    setSelectedEnvironment(null);
    setIsCreating(false);
    // Refresh environments list
    fetchEnvironments();
  };

  const activeEnvironment = environments.find(env => env.is_active);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Manage Environments"
        size="lg"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Environments allow you to use different variable values for different contexts
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                icon={<HelpCircle className="h-4 w-4" />}
                onClick={() => setShowGuide(true)}
              >
                Variable Guide
              </Button>
              <Button
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
                onClick={handleCreateNew}
              >
                New Environment
              </Button>
            </div>
          </div>

          {/* Active Environment */}
          {activeEnvironment && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Active Environment</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-900">{activeEnvironment.name}</h3>
                  <p className="text-sm text-green-700">
                    {Object.keys(JSON.parse(activeEnvironment.variables || '{}')).length} variables defined
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Settings className="h-4 w-4" />}
                  onClick={() => handleEditEnvironment(activeEnvironment)}
                  className="text-green-700 hover:bg-green-100"
                >
                  Edit
                </Button>
              </div>
            </div>
          )}

          {/* Environments List */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">All Environments</h3>
            
            {environments.length > 0 ? (
              <div className="space-y-2">
                {environments.map((environment) => {
                  const variableCount = Object.keys(JSON.parse(environment.variables || '{}')).length;
                  const isActive = environment.is_active;
                  
                  return (
                    <div
                      key={environment.id}
                      className={cn(
                        'p-4 border rounded-lg transition-colors',
                        isActive 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleSetActive(environment)}
                            className={cn(
                              'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                              isActive
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300 hover:border-green-400'
                            )}
                          >
                            {isActive && <Check className="h-2.5 w-2.5 text-white" />}
                          </button>
                          
                          <div>
                            <h4 className={cn(
                              'font-medium',
                              isActive ? 'text-green-900' : 'text-gray-900'
                            )}>
                              {environment.name}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{variableCount} variables</span>
                              <span>Created {formatDate(environment.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<Settings className="h-4 w-4" />}
                            onClick={() => handleEditEnvironment(environment)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-gray-400" />
                </div>
                
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  No environments created
                </h3>
                
                <p className="text-sm text-gray-500 mb-4">
                  Create your first environment to start using variables in your requests
                </p>
                
                <Button
                  variant="primary"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={handleCreateNew}
                >
                  Create Environment
                </Button>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">How to use variables:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>• Use <code className="px-1 py-0.5 bg-blue-100 rounded text-xs">{`{{ variableName }}`}</code> in request URLs, headers, and body</div>
              <div>• Variables from the active environment will be automatically substituted</div>
              <div>• Perfect for switching between dev, staging, and production environments</div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Environment Modal */}
      <EnvironmentModal
        isOpen={showEnvironmentModal}
        onClose={handleEnvironmentModalClose}
        environment={selectedEnvironment}
      />

      {/* Variables Guide */}
      <EnvironmentVariablesGuide
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </>
  );
};