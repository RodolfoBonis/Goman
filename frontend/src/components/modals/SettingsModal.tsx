import React from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button, Input } from '@/components/ui';
import { Settings } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [theme, setTheme] = React.useState('light');
  const [timeout, setTimeout] = React.useState('5000');

  const handleSave = () => {
    // TODO: Implement settings save
    console.log('Save settings:', { theme, timeout });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      description="Configure your API client preferences"
      size="md"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            <Settings className="h-8 w-8 text-gray-500" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Application Settings</h3>
            <p className="text-sm text-gray-700">
              Customize your API client experience
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <label htmlFor="timeout" className="block text-sm font-medium text-gray-700 mb-2">
              Request Timeout (ms)
            </label>
            <Input
              id="timeout"
              type="number"
              value={timeout}
              onChange={(e) => setTimeout(e.target.value)}
              placeholder="5000"
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">About</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>GoMan API Client</strong></p>
              <p>Version: 1.0.0</p>
              <p>Built with Wails v3, React, and Go</p>
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
};