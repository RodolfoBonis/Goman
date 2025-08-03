import React from 'react';
import { Info, Copy } from 'lucide-react';
import { Button } from './Button';

interface EnvironmentVariablesGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnvironmentVariablesGuide: React.FC<EnvironmentVariablesGuideProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedExample, setCopiedExample] = React.useState<string | null>(null);

  const examples = [
    {
      title: "API Base URL",
      description: "Use different base URLs for dev, staging, and production",
      variable: "BASE_URL",
      values: {
        Development: "https://api-dev.example.com",
        Staging: "https://api-staging.example.com", 
        Production: "https://api.example.com"
      },
      usage: "{{ BASE_URL }}/users"
    },
    {
      title: "API Key",
      description: "Use different API keys for different environments",
      variable: "API_KEY",
      values: {
        Development: "dev_key_123",
        Staging: "stage_key_456",
        Production: "prod_key_789"
      },
      usage: "Authorization: Bearer {{ API_KEY }}"
    },
    {
      title: "User ID",
      description: "Test with different user IDs",
      variable: "USER_ID",
      values: {
        Development: "test-user-123",
        Staging: "staging-user-456",
        Production: "real-user-789"
      },
      usage: "/users/{{ USER_ID }}/profile"
    }
  ];

  const copyToClipboard = (text: string, example: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(example);
    setTimeout(() => setCopiedExample(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Environment Variables Guide</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Introduction */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">How Environment Variables Work</h3>
            <div className="prose text-gray-600">
              <p>
                Environment variables allow you to use different values for the same variable name 
                across different environments (Development, Staging, Production, etc.).
              </p>
              <p>
                Use the syntax <code className="px-2 py-1 bg-gray-100 rounded text-sm">{`{{ variableName }}`}</code> anywhere 
                in your requests: URLs, headers, or request body.
              </p>
            </div>
          </div>

          {/* Examples */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Common Use Cases</h3>
            
            {examples.map((example, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{example.title}</h4>
                    <p className="text-sm text-gray-600">{example.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(example.values).map(([env, value]) => (
                      <div key={env} className="bg-gray-50 p-3 rounded">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          {env}
                        </div>
                        <div className="font-mono text-sm text-gray-900 break-all">
                          {example.variable}: {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-blue-700 mb-1">Usage Example:</div>
                        <code className="text-sm text-blue-800 font-mono">{example.usage}</code>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Copy className="h-4 w-4" />}
                        onClick={() => copyToClipboard(example.usage, example.title)}
                        className="text-blue-600 hover:bg-blue-100"
                      >
                        {copiedExample === example.title ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Best Practices */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Best Practices</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-green-700">✅ Do:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Use UPPERCASE names for variables</li>
                  <li>• Use descriptive variable names</li>
                  <li>• Group related variables</li>
                  <li>• Keep sensitive data secure</li>
                  <li>• Test variables in each environment</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-red-700">❌ Don't:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Use spaces in variable names</li>
                  <li>• Hard-code sensitive values</li>
                  <li>• Mix environments accidentally</li>
                  <li>• Forget to update all environments</li>
                  <li>• Use production keys in development</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Syntax Reference */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Variable Syntax Reference</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-4">
                <code className="px-2 py-1 bg-white border rounded text-xs">{`{{ VARIABLE_NAME }}`}</code>
                <span className="text-gray-600">Standard syntax (recommended)</span>
              </div>
              <div className="flex items-center gap-4">
                <code className="px-2 py-1 bg-white border rounded text-xs">{`{{VARIABLE_NAME}}`}</code>
                <span className="text-gray-600">Compact syntax (also works)</span>
              </div>
              <div className="flex items-center gap-4">
                <code className="px-2 py-1 bg-white border rounded text-xs">{`{{ VARIABLE_NAME }}`}</code>
                <span className="text-gray-600">Extra spaces (handled automatically)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <Button variant="primary" onClick={onClose}>
              Got it!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};