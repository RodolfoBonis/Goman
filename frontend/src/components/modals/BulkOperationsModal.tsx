import React from 'react';
import { Play, Pause, Square, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Button, Modal, Select } from '@/components/ui';
import { useAPIStore } from '@/store';
import { ResponseChaining } from '@/utils/responseChaining';
import type { Request, APIResponse } from '@/types';

interface BulkOperation {
  id: string;
  request: Request;
  status: 'pending' | 'running' | 'completed' | 'failed';
  response?: APIResponse;
  error?: string;
  startTime?: number;
  endTime?: number;
}

interface BulkOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequests?: Request[];
}

export const BulkOperationsModal: React.FC<BulkOperationsModalProps> = ({
  isOpen,
  onClose,
  selectedRequests = [],
}) => {
  const { executeRequest } = useAPIStore();
  const [operations, setOperations] = React.useState<BulkOperation[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [executionMode, setExecutionMode] = React.useState<'sequential' | 'parallel'>('sequential');
  const [delayBetweenRequests, setDelayBetweenRequests] = React.useState(1000);
  const [useResponseChaining, setUseResponseChaining] = React.useState(false);
  const [responseValues, setResponseValues] = React.useState<Record<string, string>>({});

  // Inicializar operações quando o modal abre
  React.useEffect(() => {
    if (isOpen && selectedRequests.length > 0) {
      const newOperations: BulkOperation[] = selectedRequests.map(request => ({
        id: `op-${Date.now()}-${Math.random()}`,
        request,
        status: 'pending',
      }));
      setOperations(newOperations);
      setCurrentIndex(0);
      setResponseValues({});
    }
  }, [isOpen, selectedRequests]);

  const executeOperation = async (operation: BulkOperation): Promise<BulkOperation> => {
    try {
      // Aplicar valores de resposta anterior se habilitado
      let requestData = {
        url: operation.request.url,
        headers: operation.request.headers,
        body: operation.request.body,
      };

      if (useResponseChaining && Object.keys(responseValues).length > 0) {
        requestData = ResponseChaining.applyResponseValues(requestData, responseValues);
      }

      const response = await executeRequest(
        operation.request.method,
        requestData.url,
        requestData.headers,
        requestData.body
      );

      // Extrair valores para próxima requisição
      if (useResponseChaining) {
        const newValues = ResponseChaining.extractValues(response);
        setResponseValues(prev => ({ ...prev, ...newValues }));
      }

      return {
        ...operation,
        status: 'completed',
        response,
        endTime: Date.now(),
      };
    } catch (error) {
      return {
        ...operation,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        endTime: Date.now(),
      };
    }
  };

  const executeSequentially = async () => {
    setIsRunning(true);
    setCurrentIndex(0);

    for (let i = 0; i < operations.length; i++) {
      if (!isRunning) break; // Verificar se foi pausado

      setCurrentIndex(i);
      
      // Atualizar status para running
      setOperations(prev => prev.map((op, index) => 
        index === i ? { ...op, status: 'running', startTime: Date.now() } : op
      ));

      // Executar operação
      const updatedOperation = await executeOperation(operations[i]);
      
      // Atualizar operação
      setOperations(prev => prev.map((op, index) => 
        index === i ? updatedOperation : op
      ));

      // Delay entre requisições (exceto a última)
      if (i < operations.length - 1 && delayBetweenRequests > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
      }
    }

    setIsRunning(false);
  };

  const executeParallel = async () => {
    setIsRunning(true);

    // Marcar todas como running
    setOperations(prev => prev.map(op => ({ 
      ...op, 
      status: 'running', 
      startTime: Date.now() 
    })));

    // Executar todas em paralelo
    const promises = operations.map(async (operation) => {
      const result = await executeOperation(operation);
      setOperations(prev => prev.map(op => 
        op.id === operation.id ? result : op
      ));
      return result;
    });

    await Promise.all(promises);
    setIsRunning(false);
  };

  const startExecution = () => {
    if (executionMode === 'sequential') {
      executeSequentially();
    } else {
      executeParallel();
    }
  };

  const pauseExecution = () => {
    setIsRunning(false);
  };

  const stopExecution = () => {
    setIsRunning(false);
    setOperations(prev => prev.map(op => 
      op.status === 'running' ? { ...op, status: 'pending' } : op
    ));
    setCurrentIndex(0);
  };

  const resetOperations = () => {
    setOperations(prev => prev.map(op => ({
      ...op,
      status: 'pending',
      response: undefined,
      error: undefined,
      startTime: undefined,
      endTime: undefined,
    })));
    setCurrentIndex(0);
    setResponseValues({});
  };

  const getStatusIcon = (status: BulkOperation['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: BulkOperation['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'running':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
    }
  };

  const getExecutionTime = (operation: BulkOperation) => {
    if (!operation.startTime || !operation.endTime) return null;
    return `${operation.endTime - operation.startTime}ms`;
  };

  const completedCount = operations.filter(op => op.status === 'completed').length;
  const failedCount = operations.filter(op => op.status === 'failed').length;
  const totalCount = operations.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Bulk Operations
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {completedCount}/{totalCount} completed
            </span>
            {failedCount > 0 && (
              <span className="text-sm text-red-500">
                {failedCount} failed
              </span>
            )}
          </div>
        </div>

        {/* Configuration */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Execution Mode
              </label>
              <Select
                options={[
                  { value: 'sequential', label: 'Sequential (one by one)' },
                  { value: 'parallel', label: 'Parallel (all at once)' },
                ]}
                value={executionMode}
                onChange={(value) => setExecutionMode(value as 'sequential' | 'parallel')}
                disabled={isRunning}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay Between Requests (ms)
              </label>
              <input
                type="number"
                min="0"
                max="10000"
                value={delayBetweenRequests}
                onChange={(e) => setDelayBetweenRequests(Number(e.target.value))}
                disabled={isRunning || executionMode === 'parallel'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={useResponseChaining}
                onChange={(e) => setUseResponseChaining(e.target.checked)}
                disabled={isRunning}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Use response chaining (pass values from previous responses)
              </span>
            </label>
          </div>
        </div>

        {/* Operations List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {operations.map((operation, index) => (
              <div
                key={operation.id}
                className={`
                  p-4 border rounded-lg transition-colors
                  ${operation.status === 'running' ? 'border-blue-200 bg-blue-50' : ''}
                  ${operation.status === 'completed' ? 'border-green-200 bg-green-50' : ''}
                  ${operation.status === 'failed' ? 'border-red-200 bg-red-50' : ''}
                  ${index === currentIndex && isRunning ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(operation.status)}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {operation.request.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {operation.request.method} {operation.request.url}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {operation.response && (
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {operation.response.status}
                      </span>
                    )}
                    {getExecutionTime(operation) && (
                      <span className="text-xs text-gray-500">
                        {getExecutionTime(operation)}
                      </span>
                    )}
                  </div>
                </div>

                {operation.error && (
                  <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    {operation.error}
                  </div>
                )}

                {operation.response && useResponseChaining && (
                  <div className="mt-2 p-2 bg-blue-100 border border-blue-200 rounded text-xs text-blue-700">
                    <span className="font-medium">Available values:</span>
                    {ResponseChaining.generatePlaceholderSuggestions(operation.response)
                      .slice(0, 5)
                      .map(key => (
                        <code key={key} className="ml-1 px-1 py-0.5 bg-blue-200 rounded">
                          {`{{${key}}}`}
                        </code>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isRunning ? (
                <Button
                  variant="primary"
                  icon={<Play className="h-4 w-4" />}
                  onClick={startExecution}
                  disabled={operations.length === 0}
                >
                  Start Execution
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    icon={<Pause className="h-4 w-4" />}
                    onClick={pauseExecution}
                  >
                    Pause
                  </Button>
                  <Button
                    variant="secondary"
                    icon={<Square className="h-4 w-4" />}
                    onClick={stopExecution}
                  >
                    Stop
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                onClick={resetOperations}
                disabled={isRunning}
              >
                Reset
              </Button>
            </div>

            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}; 