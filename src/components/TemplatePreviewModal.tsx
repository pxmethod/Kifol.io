'use client';

import { getTemplateConfig } from '@/config/templates';
import TemplateFactory from './templates/TemplateFactory';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
  selectedTemplate?: string;
}

export default function TemplatePreviewModal({
  isOpen,
  onClose,
  onSelect,
  selectedTemplate
}: TemplatePreviewModalProps) {
  if (!isOpen) return null;

  const templates = [
    { id: 'ren', name: 'Ren', description: 'Clean and modern design' },
    { id: 'maeve', name: 'Maeve', description: 'Elegant and sophisticated' },
    { id: 'jack', name: 'Jack', description: 'Bold and dynamic' },
    { id: 'adler', name: 'Adler', description: 'Classic and timeless' }
  ];

  const currentTemplate = templates.find(t => t.id === selectedTemplate);
  
  // Sample portfolio data for preview
  const samplePortfolio = {
    id: 'preview',
    childName: 'Alex Johnson',
    portfolioTitle: 'My Learning Journey',
    photoUrl: '',
    template: selectedTemplate || 'ren',
    createdAt: new Date().toISOString(),
    achievements: [
      {
        id: '1',
        title: 'First Steps',
        date: '2024-01-15',
        description: 'Took my first steps independently',
        media: [],
        isMilestone: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        title: 'First Words',
        date: '2024-02-20',
        description: 'Said my first words clearly',
        media: [],
        isMilestone: false,
        createdAt: '2024-02-20T14:30:00Z',
        updatedAt: '2024-02-20T14:30:00Z'
      }
    ]
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-kifolio-text">
            Template Preview
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentTemplate ? (
            <div className="space-y-6">
              {/* Template Info */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-kifolio-text mb-2">
                  {currentTemplate.name}
                </h3>
                <p className="text-gray-600">{currentTemplate.description}</p>
              </div>

              {/* Template Preview */}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <div className="h-96 overflow-y-auto">
                  <TemplateFactory portfolio={samplePortfolio} />
                </div>
              </div>

              {/* Template Features */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-kifolio-text mb-3">Template Features:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Responsive design for all devices
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Easy to customize and update
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Optimized for sharing
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Please select a template to preview</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
          {currentTemplate && (
            <button
              onClick={() => {
                onSelect(currentTemplate.id);
                onClose();
              }}
              className="px-6 py-2 bg-kifolio-cta text-white rounded-lg hover:bg-kifolio-cta/90"
            >
              Select Template
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 