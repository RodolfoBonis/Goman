import React from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { PostmanConverter } from '@/utils/postmanConverter';
import { useAPIStore } from '@/store';
import { apiService } from '@/services/api';
import type { PostmanCollection } from '@/types';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { collections, folders, requests, createCollection, createFolder, createRequest } = useAPIStore();
  const [activeTab, setActiveTab] = React.useState<'import' | 'export'>('import');
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedCollections, setSelectedCollections] = React.useState<Set<number>>(new Set());
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [importResult, setImportResult] = React.useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 Import file selected:', file.name, file.size, 'bytes');
    setIsLoading(true);
    setImportResult(null);

    try {
      const text = await file.text();
      console.log('📄 File content length:', text.length);
      
      const postmanCollection: PostmanCollection = JSON.parse(text);
      console.log('📦 Parsed Postman collection:', postmanCollection);

      // Validar se é uma collection válida do Postman
      if (!postmanCollection.info || !postmanCollection.item) {
        throw new Error('Invalid Postman collection format');
      }

      // Converter usando o PostmanConverter
      console.log('🔄 Converting Postman collection...');
      const { collection, folders: newFolders, requests: newRequests } = 
        PostmanConverter.importFromPostman(postmanCollection);
      
      console.log('📁 Converted collection:', collection);
      console.log('📁 Converted folders:', newFolders);
      console.log('📁 Converted requests:', newRequests);

      // Criar a collection
      console.log('➕ Creating collection...');
      const createdCollection = await createCollection(
        collection.name,
        collection.description
      );
      console.log('✅ Collection created:', createdCollection);

      // Criar as pastas
      console.log('📁 Creating folders...');
      const createdFolders = new Map<number, any>();
      for (let i = 0; i < newFolders.length; i++) {
        const folder = newFolders[i];
        console.log(`📁 Creating folder ${i + 1}/${newFolders.length}:`, folder.name);
        const createdFolder = await createFolder(
          folder.name,
          createdCollection.id,
          folder.parent_folder_id !== undefined ? createdFolders.get(folder.parent_folder_id)?.id : undefined
        );
        createdFolders.set(i, createdFolder);
        console.log('✅ Folder created:', createdFolder);
      }

      // Criar as requisições
      console.log('📄 Creating requests...');
      for (let i = 0; i < newRequests.length; i++) {
        const request = newRequests[i];
        console.log(`📄 Creating request ${i + 1}/${newRequests.length}:`, request.name);
        const createdRequest = await createRequest(
          request.name,
          request.method,
          request.url,
          request.headers,
          request.body,
          createdCollection.id,
          request.folder_id !== undefined ? createdFolders.get(request.folder_id)?.id : undefined
        );
        console.log('✅ Request created:', createdRequest);
      }

      setImportResult({
        success: true,
        message: `Successfully imported "${collection.name}"`,
        details: `Imported ${newRequests.length} requests and ${newFolders.length} folders`,
      });

      // Limpar o input
      event.target.value = '';
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        success: false,
        message: 'Failed to import collection',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    console.log('🚀 Export button clicked');
    console.log('📊 Collections:', collections);
    console.log('📊 Selected collections:', selectedCollections);
    
    try {
      // Converter para formato Postman
      const selectedIds = selectedCollections.size > 0 
        ? Array.from(selectedCollections)
        : undefined;
        
      console.log('🎯 Selected IDs:', selectedIds);
        
      const postmanCollections = PostmanConverter.exportToPostman(
        collections,
        folders,
        requests,
        selectedIds
      );

      console.log('📦 Postman collections:', postmanCollections);

      // Criar arquivo para download
      const dataStr = JSON.stringify(postmanCollections, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Nome do arquivo baseado na seleção
      let filename = 'goman-collections';
      if (selectedIds && selectedIds.length === 1) {
        const collection = collections.find(c => c.id === selectedIds[0]);
        filename = collection ? collection.name : 'collection';
      } else if (selectedIds && selectedIds.length > 1) {
        filename = 'multiple-collections';
      }
      filename += `-${new Date().toISOString().split('T')[0]}.json`;
      
      console.log('📁 Filename:', filename);
      
      // Usar a API do backend para salvar na pasta Downloads
      try {
        console.log('📁 Saving file to Downloads folder...');
        
        const savedPath = await apiService.saveFileToDownloads(filename, dataStr);
        console.log('✅ File saved to:', savedPath);
        
      } catch (error) {
        console.error('❌ Failed to save file:', error);
        
        // Fallback para download automático
        console.log('⚠️ Using browser fallback');
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ File downloaded automatically');
      } finally {
        URL.revokeObjectURL(url);
      }
      
      console.log('✅ Export completed successfully');
      
      setImportResult({
        success: true,
        message: 'Collections exported successfully',
        details: `Exported ${selectedIds ? selectedIds.length : collections.length} collection(s)`,
      });
    } catch (error) {
      console.error('❌ Export failed:', error);
      setImportResult({
        success: false,
        message: 'Failed to export collections',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleClose = () => {
    setImportResult(null);
    setActiveTab('import');
    setSelectedCollections(new Set());
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Import / Export Collections"
      size="lg"
    >

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('import')}
            className={`
              flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === 'import'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Import from Postman
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`
              flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === 'export'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <Download className="h-4 w-4 inline mr-2" />
            Export to Postman
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'import' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Import Postman Collection
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select a Postman collection file (.json) to import into GoMan.
                </p>
                
                <div 
                  className={`
                    border-2 border-dashed rounded-lg p-6 text-center transition-colors
                    ${isLoading 
                      ? 'border-gray-200 bg-gray-50' 
                      : isDragOver
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                    }
                  `}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragOver(false);
                    
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      const file = files[0];
                      if (file.type === 'application/json' || file.name.endsWith('.json')) {
                        const event = {
                          target: { files: [file] }
                        } as React.ChangeEvent<HTMLInputElement>;
                        handleImport(event);
                      }
                    }
                  }}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-3">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                        disabled={isLoading}
                      />
                      <Button
                        variant="primary"
                        disabled={isLoading}
                        loading={isLoading}
                      >
                        Choose File
                      </Button>
                    </label>
                    <div className="text-sm text-gray-500">
                      <p>or drag and drop a JSON file here</p>
                      <p className="text-xs mt-1">Supports Postman Collection v2.1.0 format</p>
                    </div>
                  </div>
                </div>
              </div>

              {importResult && (
                <div className={`
                  p-4 rounded-lg border
                  ${importResult.success
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                  }
                `}>
                  <div className="flex items-start">
                    {importResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">{importResult.message}</p>
                      {importResult.details && (
                        <p className="text-sm mt-1">{importResult.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Export to Postman
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select which collections to export to Postman format.
                </p>
                
                {/* Collection Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Select Collections
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedCollections.size > 0 
                          ? `${selectedCollections.size} selected`
                          : 'All collections will be exported'
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedCollections(new Set())}
                        disabled={selectedCollections.size === 0}
                      >
                        Clear All
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedCollections(new Set(collections.map(c => c.id)))}
                        disabled={selectedCollections.size === collections.length}
                      >
                        Select All
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {collections.map(collection => {
                      const collectionRequests = requests.filter(r => r.collection_id === collection.id);
                      const collectionFolders = folders.filter(f => f.collection_id === collection.id);
                      const isSelected = selectedCollections.has(collection.id);
                      
                      return (
                        <div
                          key={collection.id}
                          className={`
                            flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors
                            ${isSelected 
                              ? 'bg-primary-50 border-primary-200' 
                              : 'bg-white border-gray-200 hover:border-gray-300'
                            }
                          `}
                          onClick={() => {
                            const newSelected = new Set(selectedCollections);
                            if (isSelected) {
                              newSelected.delete(collection.id);
                            } else {
                              newSelected.add(collection.id);
                            }
                            setSelectedCollections(newSelected);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Handled by onClick
                              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {collection.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {collectionRequests.length} request{collectionRequests.length !== 1 ? 's' : ''}, {collectionFolders.length} folder{collectionFolders.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex justify-end pt-6">
                  <Button
                    variant="primary"
                    icon={<Download className="h-4 w-4" />}
                    onClick={handleExport}
                    disabled={collections.length === 0}
                  >
                    Export {selectedCollections.size > 0 ? `${selectedCollections.size} Collection${selectedCollections.size !== 1 ? 's' : ''}` : 'All Collections'}
                  </Button>
                </div>
                
                {importResult && (
                  <div className={`
                    p-4 rounded-lg border mt-4
                    ${importResult.success
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                    }
                  `}>
                    <div className="flex items-start">
                      {importResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{importResult.message}</p>
                        {importResult.details && (
                          <p className="text-sm mt-1">{importResult.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
  );
}; 