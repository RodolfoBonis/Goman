import React from 'react';
import { Play, Plus, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { cn } from '@/utils';
import Editor from '@monaco-editor/react';

interface TestAssertion {
  id: string;
  enabled: boolean;
  type: 'status' | 'header' | 'body' | 'time' | 'custom';
  field?: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
  value: string;
  description?: string;
}

interface TestResult {
  id: string;
  passed: boolean;
  message: string;
  actual?: any;
  expected?: any;
}

const TEST_TYPES = [
  { value: 'status', label: 'Status Code' },
  { value: 'header', label: 'Response Header' },
  { value: 'body', label: 'Response Body' },
  { value: 'time', label: 'Response Time' },
  { value: 'custom', label: 'Custom Script' },
];

const OPERATORS = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'not_contains', label: 'does not contain' },
  { value: 'greater_than', label: 'greater than' },
  { value: 'less_than', label: 'less than' },
  { value: 'exists', label: 'exists' },
  { value: 'not_exists', label: 'does not exist' },
];

export const TestsTab: React.FC = () => {
  const [assertions, setAssertions] = React.useState<TestAssertion[]>([]);
  const [testScript, setTestScript] = React.useState('');
  const [testResults, setTestResults] = React.useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'assertions' | 'script'>('assertions');

  const addAssertion = () => {
    const newAssertion: TestAssertion = {
      id: Date.now().toString(),
      enabled: true,
      type: 'status',
      operator: 'equals',
      value: '200',
    };
    setAssertions(prev => [...prev, newAssertion]);
  };

  const updateAssertion = (id: string, field: keyof TestAssertion, value: any) => {
    setAssertions(prev => prev.map(assertion => 
      assertion.id === id ? { ...assertion, [field]: value } : assertion
    ));
  };

  const removeAssertion = (id: string) => {
    setAssertions(prev => prev.filter(assertion => assertion.id !== id));
  };

  const runTests = async () => {
    setIsRunning(true);
    // TODO: Implement test execution
    setTimeout(() => {
      // Mock test results
      const results: TestResult[] = assertions.map(assertion => ({
        id: assertion.id,
        passed: Math.random() > 0.3,
        message: `Test "${assertion.description || `${assertion.type} ${assertion.operator} ${assertion.value}`}" ${Math.random() > 0.3 ? 'passed' : 'failed'}`,
        actual: Math.random() > 0.5 ? '200' : '404',
        expected: assertion.value,
      }));
      setTestResults(results);
      setIsRunning(false);
    }, 1000);
  };

  const getAssertionSummary = (assertion: TestAssertion) => {
    const parts = [assertion.type];
    if (assertion.field) parts.push(assertion.field);
    parts.push(assertion.operator, assertion.value);
    return parts.join(' ');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Tests</h3>
            <p className="text-xs text-gray-500 mt-1">
              Write tests to validate your API responses
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              loading={isRunning}
              icon={<Play className="h-4 w-4" />}
              onClick={runTests}
              disabled={assertions.length === 0 && !testScript}
            >
              Run Tests
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex mt-4 bg-gray-100 p-1 rounded-lg">
          <button
            className={cn(
              'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              activeTab === 'assertions'
                ? 'bg-white text-gray-900 shadow-soft'
                : 'text-gray-600 hover:text-gray-900'
            )}
            onClick={() => setActiveTab('assertions')}
          >
            Assertions ({assertions.length})
          </button>
          <button
            className={cn(
              'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              activeTab === 'script'
                ? 'bg-white text-gray-900 shadow-soft'
                : 'text-gray-600 hover:text-gray-900'
            )}
            onClick={() => setActiveTab('script')}
          >
            Test Script
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Test Results</h4>
          <div className="space-y-2">
            {testResults.map((result) => (
              <div
                key={result.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg',
                  result.passed 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {result.passed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    'text-sm font-medium',
                    result.passed ? 'text-green-900' : 'text-red-900'
                  )}>
                    {result.message}
                  </p>
                  {!result.passed && result.actual && result.expected && (
                    <div className="mt-1 text-xs">
                      <span className="text-red-700">Expected: {result.expected}</span>
                      <span className="text-red-700 ml-4">Actual: {result.actual}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'assertions' ? (
          <div className="flex-1 overflow-y-auto">
            {assertions.length > 0 ? (
              <div className="p-4">
                <div className="space-y-3">
                  {assertions.map((assertion) => (
                    <div
                      key={assertion.id}
                      className={cn(
                        'p-4 border rounded-lg transition-colors',
                        assertion.enabled 
                          ? 'border-gray-200 bg-white' 
                          : 'border-gray-100 bg-gray-50 opacity-60'
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={assertion.enabled}
                            onChange={(e) => updateAssertion(assertion.id, 'enabled', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {getAssertionSummary(assertion)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeAssertion(assertion.id)}
                          className="p-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-gray-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-12 gap-3">
                        {/* Test Type */}
                        <div className="col-span-3">
                          <Select
                            options={TEST_TYPES}
                            value={assertion.type}
                            onChange={(value) => updateAssertion(assertion.id, 'type', value)}
                            disabled={!assertion.enabled}
                          />
                        </div>

                        {/* Field (for header/body tests) */}
                        {(assertion.type === 'header' || assertion.type === 'body') && (
                          <div className="col-span-3">
                            <Input
                              value={assertion.field || ''}
                              onChange={(e) => updateAssertion(assertion.id, 'field', e.target.value)}
                              placeholder={assertion.type === 'header' ? 'Header name' : 'JSON path'}
                              disabled={!assertion.enabled}
                            />
                          </div>
                        )}

                        {/* Operator */}
                        <div className={cn(
                          assertion.type === 'header' || assertion.type === 'body' 
                            ? 'col-span-3' 
                            : 'col-span-6'
                        )}>
                          <Select
                            options={OPERATORS}
                            value={assertion.operator}
                            onChange={(value) => updateAssertion(assertion.id, 'operator', value)}
                            disabled={!assertion.enabled}
                          />
                        </div>

                        {/* Value */}
                        <div className="col-span-3">
                          <Input
                            value={assertion.value}
                            onChange={(e) => updateAssertion(assertion.id, 'value', e.target.value)}
                            placeholder="Expected value"
                            disabled={!assertion.enabled}
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mt-3">
                        <Input
                          value={assertion.description || ''}
                          onChange={(e) => updateAssertion(assertion.id, 'description', e.target.value)}
                          placeholder="Test description (optional)"
                          disabled={!assertion.enabled}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={addAssertion}
                  className="mt-4"
                >
                  Add Assertion
                </Button>
              </div>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-sm">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    No test assertions
                  </h3>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    Add assertions to validate your API responses automatically
                  </p>
                  
                  <Button
                    variant="primary"
                    icon={<Plus className="h-4 w-4" />}
                    onClick={addAssertion}
                  >
                    Add Assertion
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Test Script Tab */
          <div className="flex-1 flex flex-col p-4">
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-900 mb-1">Custom Test Script</h4>
              <p className="text-xs text-gray-500">
                Write JavaScript code to perform custom validations on the response
              </p>
            </div>
            
            <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={testScript}
                onChange={(value) => setTestScript(value || '')}
                theme="vs"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  tabSize: 2,
                  insertSpaces: true,
                  automaticLayout: true,
                }}
              />
            </div>

            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Available Variables:</p>
                <ul className="space-y-1">
                  <li><code>response.status</code> - Response status code</li>
                  <li><code>response.headers</code> - Response headers object</li>
                  <li><code>response.body</code> - Response body (parsed if JSON)</li>
                  <li><code>response.time</code> - Response time in milliseconds</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};