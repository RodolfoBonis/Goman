import React from 'react';
import { Eye, EyeOff, Key, Shield, User } from 'lucide-react';
import { Select, Input } from '@/components/ui';
import { useUIStore } from '@/store';
import { cn } from '@/utils';
import type { AuthType } from '@/types';

const AUTH_TYPES: { value: AuthType; label: string; icon: React.ReactNode }[] = [
  { value: 'none', label: 'No Auth', icon: <Shield className="h-4 w-4" /> },
  { value: 'bearer', label: 'Bearer Token', icon: <Key className="h-4 w-4" /> },
  { value: 'basic', label: 'Basic Auth', icon: <User className="h-4 w-4" /> },
  { value: 'api-key', label: 'API Key', icon: <Key className="h-4 w-4" /> },
];

export const AuthTab: React.FC = () => {
  const { activeRequest, updateActiveRequestField } = useUIStore();
  
  const [authType, setAuthType] = React.useState<AuthType>(
    activeRequest?.auth?.type || 'none'
  );
  const [authData, setAuthData] = React.useState({
    token: activeRequest?.auth?.token || '',
    username: activeRequest?.auth?.username || '',
    password: activeRequest?.auth?.password || '',
    key: activeRequest?.auth?.key || '',
    value: activeRequest?.auth?.value || '',
    addTo: activeRequest?.auth?.addTo || 'header' as 'header' | 'query',
  });
  
  const [showPassword, setShowPassword] = React.useState(false);
  const [showToken, setShowToken] = React.useState(false);

  // Sync auth data when activeRequest changes
  React.useEffect(() => {
    if (activeRequest?.auth) {
      setAuthType(activeRequest.auth.type || 'none');
      setAuthData({
        token: activeRequest.auth.token || '',
        username: activeRequest.auth.username || '',
        password: activeRequest.auth.password || '',
        key: activeRequest.auth.key || '',
        value: activeRequest.auth.value || '',
        addTo: activeRequest.auth.addTo || 'header',
      });
    } else {
      setAuthType('none');
      setAuthData({
        token: '',
        username: '',
        password: '',
        key: '',
        value: '',
        addTo: 'header',
      });
    }
  }, [activeRequest?.id]);

  // Update store when auth data changes (but not on initial mount)
  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (activeRequest) {
      updateActiveRequestField('auth', {
        type: authType,
        ...authData,
      });
    }
  }, [authType, authData]);

  const updateAuthData = (field: string, value: string) => {
    setAuthData(prev => ({ ...prev, [field]: value }));
  };

  const renderAuthForm = () => {
    switch (authType) {
      case 'none':
        return (
          <div className="flex-1 flex flex-col justify-center p-8">
            <div className="text-center max-w-lg mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                No Authentication Required
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                This request will be sent without any authentication. Perfect for public APIs and endpoints that don't require credentials.
              </p>

              {/* Quick Auth Options */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Need authentication?</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => setAuthType('bearer')}
                    className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Key className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900">Bearer Token</h5>
                      <p className="text-xs text-gray-500">Most common for APIs</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setAuthType('basic')}
                    className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900">Basic Auth</h5>
                      <p className="text-xs text-gray-500">Username & Password</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setAuthType('api-key')}
                    className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Key className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900">API Key</h5>
                      <p className="text-xs text-gray-500">Custom key in header/query</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'bearer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bearer Token
              </label>
              <div className="relative">
                <Input
                  type={showToken ? 'text' : 'password'}
                  value={authData.token}
                  onChange={(e) => updateAuthData('token', e.target.value)}
                  placeholder="Enter your bearer token"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Token will be sent in the Authorization header as "Bearer {'{token}'}"
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Key className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Bearer Token</p>
                  <p className="text-xs">
                    Commonly used for API authentication. The token is sent in the Authorization header.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'basic':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <Input
                type="text"
                value={authData.username}
                onChange={(e) => updateAuthData('username', e.target.value)}
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={authData.password}
                  onChange={(e) => updateAuthData('password', e.target.value)}
                  placeholder="Enter password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Basic Authentication</p>
                  <p className="text-xs">
                    Credentials are base64 encoded and sent in the Authorization header as "Basic {'{encoded}'}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'api-key':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key
              </label>
              <Input
                type="text"
                value={authData.key}
                onChange={(e) => updateAuthData('key', e.target.value)}
                placeholder="e.g., X-API-Key, api_key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value
              </label>
              <div className="relative">
                <Input
                  type={showToken ? 'text' : 'password'}
                  value={authData.value}
                  onChange={(e) => updateAuthData('value', e.target.value)}
                  placeholder="Enter your API key"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add to
              </label>
              <Select
                options={[
                  { value: 'header', label: 'Header' },
                  { value: 'query', label: 'Query Params' },
                ]}
                value={authData.addTo}
                onChange={(value) => updateAuthData('addTo', value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                {authData.addTo === 'header' 
                  ? 'API key will be added as a request header'
                  : 'API key will be added as a query parameter'
                }
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Key className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">API Key</p>
                  <p className="text-xs">
                    API keys can be sent as headers or query parameters depending on the API requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const authTypeOptions = AUTH_TYPES.map(type => ({
    value: type.value,
    label: type.label,
  }));

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Authorization</h3>
            <p className="text-xs text-gray-500 mt-1">
              Configure authentication for your request
            </p>
          </div>
          
          <Select
            options={authTypeOptions}
            value={authType}
            onChange={(value) => setAuthType(value as AuthType)}
            className="w-48"
          />
        </div>
      </div>

      {/* Auth Form */}
      <div className="flex-1 p-4 overflow-y-auto">
        {renderAuthForm()}
      </div>

      {/* Auth Summary */}
      {authType !== 'none' && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
            Authentication Summary
          </h4>
          <div className="text-sm text-gray-600">
            {authType === 'bearer' && authData.token && (
              <p>Bearer token will be added to Authorization header</p>
            )}
            {authType === 'basic' && authData.username && authData.password && (
              <p>Basic auth credentials will be encoded and added to Authorization header</p>
            )}
            {authType === 'api-key' && authData.key && authData.value && (
              <p>
                API key "{authData.key}" will be added to{' '}
                {authData.addTo === 'header' ? 'request headers' : 'query parameters'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};