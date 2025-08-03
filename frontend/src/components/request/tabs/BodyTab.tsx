import React from 'react';
import { Tabs, Select, VariablePreview } from '@/components/ui';
import { useUIStore, useAPIStore } from '@/store';
import { cn } from '@/utils';
import type { BodyType } from '@/types';
import Editor from '@monaco-editor/react';

const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'form-data', label: 'Form Data' },
  { value: 'x-www-form-urlencoded', label: 'URL Encoded' },
  { value: 'raw', label: 'Raw Text' },
  { value: 'binary', label: 'Binary' },
];

const CONTENT_TYPE_MAP: Record<BodyType, string> = {
  'none': '',
  'json': 'application/json',
  'xml': 'application/xml',
  'form-data': 'multipart/form-data',
  'x-www-form-urlencoded': 'application/x-www-form-urlencoded',
  'raw': 'text/plain',
  'binary': 'application/octet-stream',
};

export const BodyTab: React.FC = () => {
  const { activeRequest, updateActiveRequestField } = useUIStore();
  const { environments } = useAPIStore();
  
  const [bodyType, setBodyType] = React.useState<BodyType>(
    activeRequest?.bodyType || 'none'
  );
  const [bodyContent, setBodyContent] = React.useState(
    activeRequest?.body || ''
  );

  // Sync body data when activeRequest changes
  React.useEffect(() => {
    if (activeRequest) {
      setBodyType(activeRequest.bodyType || 'none');
      setBodyContent(activeRequest.body || '');
    } else {
      setBodyType('none');
      setBodyContent('');
    }
  }, [activeRequest?.id]);

  // Update store when body data changes (but not on initial mount)
  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (activeRequest) {
      updateActiveRequestField('body', bodyContent);
      updateActiveRequestField('bodyType', bodyType);
      
      // Auto-update Content-Type header
      if (bodyType !== 'none') {
        const contentType = CONTENT_TYPE_MAP[bodyType];
        // TODO: Update Content-Type header in headers
      }
    }
  }, [bodyContent, bodyType]);

  const renderBodyEditor = () => {
    switch (bodyType) {
      case 'none':
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No request body</h3>
              <p className="text-sm text-gray-500">This request does not have a body</p>
            </div>
          </div>
        );

      case 'json':
        return (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={bodyContent}
                onChange={(value) => setBodyContent(value || '')}
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
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
            <VariablePreview
              text={bodyContent}
              environments={environments}
              className="p-3 border-t border-gray-200"
              label="JSON with variables:"
            />
          </div>
        );

      case 'xml':
        return (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="xml"
                value={bodyContent}
                onChange={(value) => setBodyContent(value || '')}
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
          </div>
        );

      case 'raw':
        return (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="plaintext"
                value={bodyContent}
                onChange={(value) => setBodyContent(value || '')}
                theme="vs"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
              />
            </div>
            <VariablePreview
              text={bodyContent}
              environments={environments}
              className="p-3 border-t border-gray-200"
              label="XML with variables:"
            />
          </div>
        );

      case 'form-data':
      case 'x-www-form-urlencoded':
        return <FormDataEditor bodyType={bodyType} />;

      case 'binary':
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Binary file upload</h3>
              <p className="text-sm text-gray-500 mb-4">Select a file to upload</p>
              <input
                type="file"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // TODO: Handle file upload
                    console.log('File selected:', file.name);
                  }
                }}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Body Type Selector */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Request Body</h3>
            <p className="text-xs text-gray-500 mt-1">
              Configure the body content for your request
            </p>
          </div>
          
          <Select
            options={BODY_TYPES}
            value={bodyType}
            onChange={(value) => setBodyType(value as BodyType)}
            className="w-48"
          />
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 p-4 overflow-hidden">
        {renderBodyEditor()}
      </div>
    </div>
  );
};

// Form Data Editor Component
const FormDataEditor: React.FC<{ bodyType: 'form-data' | 'x-www-form-urlencoded' }> = ({ bodyType }) => {
  const [formFields, setFormFields] = React.useState([
    { id: '1', key: '', value: '', type: 'text' as 'text' | 'file', enabled: true }
  ]);

  const addField = () => {
    setFormFields(prev => [...prev, {
      id: Date.now().toString(),
      key: '',
      value: '',
      type: 'text',
      enabled: true,
    }]);
  };

  const updateField = (id: string, field: string, value: any) => {
    setFormFields(prev => prev.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ));
  };

  const removeField = (id: string) => {
    setFormFields(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="space-y-2">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 uppercase tracking-wide pb-2">
          <div className="col-span-1"></div>
          <div className="col-span-4">Key</div>
          <div className="col-span-4">Value</div>
          {bodyType === 'form-data' && <div className="col-span-2">Type</div>}
          <div className="col-span-1"></div>
        </div>

        {/* Form Fields */}
        {formFields.map((field) => (
          <div
            key={field.id}
            className={cn(
              'grid gap-3 items-center py-2 px-3 rounded-lg border transition-colors',
              bodyType === 'form-data' ? 'grid-cols-12' : 'grid-cols-10',
              field.enabled 
                ? 'border-gray-200 bg-white' 
                : 'border-gray-100 bg-gray-50 opacity-60'
            )}
          >
            {/* Enable/Disable */}
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={field.enabled}
                onChange={(e) => updateField(field.id, 'enabled', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>

            {/* Key */}
            <div className="col-span-4">
              <input
                type="text"
                value={field.key}
                onChange={(e) => updateField(field.id, 'key', e.target.value)}
                placeholder="Field name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                disabled={!field.enabled}
              />
            </div>

            {/* Value */}
            <div className="col-span-4">
              {field.type === 'file' ? (
                <input
                  type="file"
                  onChange={(e) => updateField(field.id, 'value', e.target.files?.[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-gray-50 file:text-gray-700"
                  disabled={!field.enabled}
                />
              ) : (
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => updateField(field.id, 'value', e.target.value)}
                  placeholder="Field value"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  disabled={!field.enabled}
                />
              )}
            </div>

            {/* Type (form-data only) */}
            {bodyType === 'form-data' && (
              <div className="col-span-2">
                <select
                  value={field.type}
                  onChange={(e) => updateField(field.id, 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  disabled={!field.enabled}
                >
                  <option value="text">Text</option>
                  <option value="file">File</option>
                </select>
              </div>
            )}

            {/* Delete */}
            <div className="col-span-1 flex justify-end">
              <button
                onClick={() => removeField(field.id)}
                className="p-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-gray-400"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addField}
        className="mt-4 px-4 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
      >
        + Add Field
      </button>
    </div>
  );
};