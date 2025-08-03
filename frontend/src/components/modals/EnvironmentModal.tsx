import React from 'react';
import { Plus, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import { useAPIStore } from '@/store';
import { generateId, safeParseJSON } from '@/utils';
import type { KeyValue, Environment } from '@/types';

interface EnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  environment?: Environment | null;
}

export const EnvironmentModal: React.FC<EnvironmentModalProps> = ({
  isOpen,
  onClose,
  environment,
}) => {
  const { createEnvironment, updateEnvironment, deleteEnvironment, environments } = useAPIStore();
  
  const [name, setName] = React.useState('');
  const [isActive, setIsActive] = React.useState(false);
  const [variables, setVariables] = React.useState<KeyValue[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showValues, setShowValues] = React.useState<Set<string>>(new Set());

  // Initialize form when environment or modal state changes
  React.useEffect(() => {
    if (isOpen) {
      if (environment) {
        setName(environment.name);
        setIsActive(environment.is_active);
        
        // Parse variables from JSON string
        const parsedVars = safeParseJSON<Record<string, string>>(environment.variables, {});
        const variablesList: KeyValue[] = Object.entries(parsedVars).map(([key, value]) => ({
          id: generateId(),
          key,
          value,
          enabled: true,
        }));
        setVariables(variablesList);
      } else {
        setName('');
        setIsActive(false);
        setVariables([]);
      }
      setShowValues(new Set());
    }
  }, [isOpen, environment]);

  const addVariable = () => {
    setVariables(prev => [...prev, {
      id: generateId(),
      key: '',
      value: '',
      enabled: true,
    }]);
  };

  const updateVariable = (id: string, field: keyof KeyValue, value: string | boolean) => {
    setVariables(prev => prev.map(variable => 
      variable.id === id ? { ...variable, [field]: value } : variable
    ));
  };

  const removeVariable = (id: string) => {
    setVariables(prev => prev.filter(variable => variable.id !== id));
  };

  const toggleVariableVisibility = (id: string) => {
    setShowValues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      return; // TODO: Show validation error
    }

    setIsLoading(true);
    try {
      // Convert variables array to JSON object
      const variablesObj = variables
        .filter(v => v.key.trim())
        .reduce((acc, v) => ({ ...acc, [v.key]: v.value }), {});
      
      const variablesJson = JSON.stringify(variablesObj);

      if (environment) {
        // Update existing environment
        await updateEnvironment(environment.id, name, variablesJson, isActive);
      } else {
        // Create new environment
        await createEnvironment(name, variablesJson);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save environment:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!environment) return;

    if (confirm(`Are you sure you want to delete the environment "${environment.name}"?`)) {
      setIsLoading(true);
      try {
        await deleteEnvironment(environment.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete environment:', error);
        // TODO: Show error toast
      } finally {
        setIsLoading(false);
      }
    }
  };

  const title = environment ? 'Edit Environment' : 'Create Environment';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <div className="space-y-6">
        {/* Environment Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Environment Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Development, Production, Staging"
            className="w-full"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Set as active environment
          </label>
        </div>

        {/* Variables Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Variables</h3>
              <p className="text-xs text-gray-500 mt-1">
                Define variables that can be used in requests with syntax: {`{{ variableName }}`}
              </p>
            </div>
            
            <Button
              size="sm"
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={addVariable}
            >
              Add Variable
            </Button>
          </div>

          {/* Variables List */}
          {variables.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 uppercase tracking-wide pb-2 border-b border-gray-200">
                <div className="col-span-4">Key</div>
                <div className="col-span-6">Value</div>
                <div className="col-span-2">Actions</div>
              </div>

              {/* Variable Rows */}
              {variables.map((variable) => (
                <div
                  key={variable.id}
                  className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 rounded-lg"
                >
                  {/* Key Input */}
                  <div className="col-span-4">
                    <Input
                      value={variable.key}
                      onChange={(e) => updateVariable(variable.id, 'key', e.target.value)}
                      placeholder="Variable name"
                      className="!py-2"
                    />
                  </div>

                  {/* Value Input */}
                  <div className="col-span-6">
                    <div className="relative">
                      <Input
                        type={showValues.has(variable.id) ? 'text' : 'password'}
                        value={variable.value}
                        onChange={(e) => updateVariable(variable.id, 'value', e.target.value)}
                        placeholder="Variable value"
                        className="!py-2 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => toggleVariableVisibility(variable.id)}
                      >
                        {showValues.has(variable.id) ? 
                          <EyeOff className="h-4 w-4" /> : 
                          <Eye className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => removeVariable(variable.id)}
                      className="p-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-gray-400"
                      title="Remove variable"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
              
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                No variables defined
              </h3>
              
              <p className="text-sm text-gray-500 mb-4">
                Add variables to use them in your requests
              </p>
              
              <Button
                variant="primary"
                icon={<Plus className="h-4 w-4" />}
                onClick={addVariable}
              >
                Add Variable
              </Button>
            </div>
          )}
        </div>

        {/* Example Usage */}
        {variables.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Usage Examples:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              {variables.slice(0, 3).map((variable) => variable.key && (
                <div key={variable.id} className="font-mono">
                  {`{{ ${variable.key} }}`} → {showValues.has(variable.id) ? variable.value : '••••••••'}
                </div>
              ))}
              {variables.length > 3 && (
                <div className="text-blue-600">...and {variables.length - 3} more</div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            {environment && (
              <Button
                variant="danger"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={handleDelete}
                disabled={isLoading}
              >
                Delete Environment
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={<Save className="h-4 w-4" />}
              onClick={handleSave}
              loading={isLoading}
            >
              {environment ? 'Update' : 'Create'} Environment
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};