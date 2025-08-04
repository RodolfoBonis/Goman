import React from 'react';
import { FileText, Download, Copy, CheckCircle } from 'lucide-react';
import { Button, Modal, Select } from '@/components/ui';
import { DocumentationGenerator } from '@/utils/documentationGenerator';
import { useAPIStore } from '@/store';
import type { Collection } from '@/types';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { collections, requests, environments } = useAPIStore();
  const [selectedCollection, setSelectedCollection] = React.useState<string>('');
  const [format, setFormat] = React.useState<'markdown' | 'openapi'>('markdown');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedDoc, setGeneratedDoc] = React.useState<string>('');
  const [showCopied, setShowCopied] = React.useState(false);

  const handleGenerate = async () => {
    if (!selectedCollection) return;

    setIsGenerating(true);
    try {
      const collection = collections.find(c => c.id.toString() === selectedCollection);
      if (!collection) throw new Error('Collection not found');

      const environment = environments.find(e => e.is_active);
      
      const documentation = DocumentationGenerator.generateFromCollection(
        collection,
        requests,
        environment
      );

      let docContent = '';
      if (format === 'markdown') {
        docContent = DocumentationGenerator.generateMarkdown(documentation);
      } else {
        docContent = DocumentationGenerator.generateOpenAPI(documentation);
      }

      setGeneratedDoc(docContent);
    } catch (error) {
      console.error('Failed to generate documentation:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedDoc) return;

    const extension = format === 'markdown' ? 'md' : 'json';
    const filename = `api-documentation-${new Date().toISOString().split('T')[0]}.${extension}`;
    
    const blob = new Blob([generatedDoc], { 
      type: format === 'markdown' ? 'text/markdown' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!generatedDoc) return;

    try {
      await navigator.clipboard.writeText(generatedDoc);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleClose = () => {
    setSelectedCollection('');
    setGeneratedDoc('');
    setShowCopied(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generate API Documentation"
      description="Generate documentation for your API collections"
      size="lg"
    >
      <div className="space-y-6">
        {/* Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection *
            </label>
            <Select
              options={[
                { value: '', label: 'Select a collection' },
                ...collections.map(collection => ({
                  value: collection.id.toString(),
                  label: collection.name
                }))
              ]}
              value={selectedCollection}
              onChange={setSelectedCollection}
              placeholder="Select a collection"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <Select
              options={[
                { value: 'markdown', label: 'Markdown' },
                { value: 'openapi', label: 'OpenAPI/Swagger' }
              ]}
              value={format}
              onChange={(value) => setFormat(value as 'markdown' | 'openapi')}
              placeholder="Select format"
            />
          </div>

          <Button
            onClick={handleGenerate}
            loading={isGenerating}
            disabled={!selectedCollection || isGenerating}
            icon={<FileText className="h-4 w-4" />}
            className="w-full"
          >
            Generate Documentation
          </Button>
        </div>

        {/* Generated Documentation */}
        {generatedDoc && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Generated Documentation
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Copy className="h-4 w-4" />}
                  onClick={handleCopy}
                  className={showCopied ? 'text-green-600' : ''}
                >
                  {showCopied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    'Copy'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Download className="h-4 w-4" />}
                  onClick={handleDownload}
                >
                  Download
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {generatedDoc}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}; 