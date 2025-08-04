import React from 'react';
import { Select, VariablePreview } from '@/components/ui';
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

// const CONTENT_TYPE_MAP: Record<BodyType, string> = {
//   'none': '',
//   'json': 'application/json',
//   'xml': 'application/xml',
//   'form-data': 'multipart/form-data',
//   'x-www-form-urlencoded': 'application/x-www-form-urlencoded',
//   'raw': 'text/plain',
//   'binary': 'application/octet-stream',
// };

export const BodyTab: React.FC = () => {
  const { activeRequest, updateActiveRequestField } = useUIStore();
  const { environments } = useAPIStore();
  
  // Use store values directly instead of local state
  const bodyType = activeRequest?.bodyType || 'none';
  const bodyContent = activeRequest?.body || '';

  const setBodyType = (newType: BodyType) => {
    if (activeRequest) {
      updateActiveRequestField('bodyType', newType);
      
      // Auto-update Content-Type header
      if (newType !== 'none') {
        // const contentType = CONTENT_TYPE_MAP[newType];
        // TODO: Update Content-Type header in headers
      }
    }
  };

  const setBodyContent = (newContent: string) => {
    if (activeRequest) {
      updateActiveRequestField('body', newContent);
    }
  };

  const renderBodyEditor = () => {
    switch (bodyType) {
      case 'none':
        return (
          <div className="flex-1 flex flex-col">
            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900 mb-1">No Request Body</h3>
                  <p className="text-sm text-blue-700">
                    This request will be sent without a body. Perfect for GET, DELETE, and other requests that don't require data.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Body Type Suggestions */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Need to add data to your request?</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setBodyType('json')}
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1h-6a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">JSON</h5>
                    <p className="text-xs text-gray-500">Most common format for APIs</p>
                  </div>
                </button>

                <button
                  onClick={() => setBodyType('form-data')}
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 7a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7zm2-4a2 2 0 00-2 2v1h14V5a2 2 0 00-2-2H5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">Form Data</h5>
                    <p className="text-xs text-gray-500">For file uploads and forms</p>
                  </div>
                </button>

                <button
                  onClick={() => setBodyType('x-www-form-urlencoded')}
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">URL Encoded</h5>
                    <p className="text-xs text-gray-500">Traditional form submission</p>
                  </div>
                </button>

                <button
                  onClick={() => setBodyType('raw')}
                  className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">Raw Text</h5>
                    <p className="text-xs text-gray-500">Plain text, XML, or custom</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'json':
        return (
          <div className="flex-1 flex flex-col min-h-0">
            {/* JSON Tools - Very compact toolbar */}
            <div className="flex-shrink-0 mb-2 p-2 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">JSON Editor</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setBodyContent(`{\n  "name": "${'{{username}}'}",\n  "email": "${'{{email}}'}"\n}`)}
                  className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  title="User Object Template"
                >
                  User
                </button>
                <button
                  onClick={() => setBodyContent(`{\n  "username": "${'{{username}}'}",\n  "password": "${'{{password}}'}"\n}`)}
                  className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  title="Login Template"
                >
                  Login
                </button>
                <button
                  onClick={() => setBodyContent('{\n  "title": "Sample Title",\n  "description": "Sample description",\n  "status": "active"\n}')}
                  className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  title="Basic Object Template"
                >
                  Basic
                </button>
                <button
                  onClick={() => setBodyContent('[\n  {\n    "id": 1,\n    "name": "Item 1"\n  },\n  {\n    "id": 2,\n    "name": "Item 2"\n  }\n]')}
                  className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  title="Array Template"
                >
                  Array
                </button>
                <button
                  onClick={() => setBodyContent('')}
                  className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Clear Content"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* JSON Editor - Maximum space */}
            <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
              <Editor
                height="400px"
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
                  readOnly: false,
                }}
              />
            </div>
            
            {/* Variable preview - only if content and compact */}
            {bodyContent.trim() && bodyContent.includes('{{') && (
              <div className="flex-shrink-0 mt-2">
                <VariablePreview
                  text={bodyContent}
                  environments={environments}
                  className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs"
                  label="Variables:"
                />
              </div>
            )}
          </div>
        );

      case 'xml':
        return (
          <div className="flex-1 flex flex-col min-h-0">
            {/* XML Tools - Very compact toolbar */}
            <div className="flex-shrink-0 mb-2 p-2 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">XML Editor</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setBodyContent(`<?xml version="1.0" encoding="UTF-8"?>\n<user>\n  <name>${'{{username}}'}</name>\n  <email>${'{{email}}'}</email>\n</user>`)}
                  className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  title="User Object Template"
                >
                  User
                </button>
                <button
                  onClick={() => setBodyContent('<?xml version="1.0" encoding="UTF-8"?>\n<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">\n  <soap:Header/>\n  <soap:Body>\n    <!-- Your content here -->\n  </soap:Body>\n</soap:Envelope>')}
                  className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  title="SOAP Envelope Template"
                >
                  SOAP
                </button>
                <button
                  onClick={() => setBodyContent('<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <item id="1">\n    <name>Item 1</name>\n  </item>\n  <item id="2">\n    <name>Item 2</name>\n  </item>\n</root>')}
                  className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  title="Basic List Template"
                >
                  List
                </button>
                <button
                  onClick={() => setBodyContent('')}
                  className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Clear Content"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* XML Editor - Maximum space */}
            <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
              <Editor
                height="400px"
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
                  readOnly: false,
                }}
              />
            </div>
            
            {/* Variable preview - only if content and compact */}
            {bodyContent.trim() && bodyContent.includes('{{') && (
              <div className="flex-shrink-0 mt-2">
                <VariablePreview
                  text={bodyContent}
                  environments={environments}
                  className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs"
                  label="Variables:"
                />
              </div>
            )}
          </div>
        );

      case 'raw':
        return (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Raw Tools - Very compact toolbar */}
            <div className="flex-shrink-0 mb-2 p-2 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">Raw Text Editor</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setBodyContent('')}
                  className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Clear Content"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Raw Editor - Maximum space */}
            <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
              <Editor
                height="400px"
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
                  readOnly: false,
                }}
              />
            </div>
            
            {/* Variable preview - only if content and compact */}
            {bodyContent.trim() && bodyContent.includes('{{') && (
              <div className="flex-shrink-0 mt-2">
                <VariablePreview
                  text={bodyContent}
                  environments={environments}
                  className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs"
                  label="Variables:"
                />
              </div>
            )}
          </div>
        );

      case 'form-data':
      case 'x-www-form-urlencoded':
        return <FormDataEditor bodyType={bodyType} />;

      case 'binary':
        return (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Binary File Upload</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Upload files like images, documents, or any binary data. The file will be sent as the request body.
                </p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="binary-file-input"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // TODO: Handle file upload
                        console.log('File selected:', file.name);
                        setBodyContent(`[Binary File: ${file.name} (${(file.size / 1024).toFixed(2)} KB)]`);
                      }
                    }}
                  />
                  <label
                    htmlFor="binary-file-input"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Choose file</span>
                    <span className="text-xs text-gray-500 mt-1">or drag and drop</span>
                  </label>
                </div>

                {bodyContent.includes('[Binary File:') && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-green-800">File ready for upload</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">{bodyContent}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Body Type Selector - Compact */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Request Body</h3>
        </div>
        
        <Select
          options={BODY_TYPES}
          value={bodyType}
          onChange={(value) => setBodyType(value as BodyType)}
          className="w-48"
        />
      </div>

      {/* Body Content - Maximum space */}
      <div className="flex-1 p-3 min-h-0 overflow-hidden">
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
    <div className="flex-1 flex flex-col min-h-0">
      {/* Compact toolbar */}
      <div className="flex-shrink-0 mb-2 p-2 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">
          {bodyType === 'form-data' ? 'Form Data Editor' : 'URL Encoded Editor'}
        </span>
        <button
          onClick={addField}
          className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
        >
          Add Field
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
        {/* Header Row */}
        <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 uppercase tracking-wide pb-2 sticky top-0 bg-white">
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
    </div>
  );
};