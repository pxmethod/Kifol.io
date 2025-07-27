'use client';

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
              <div className="border-2 border-gray-200 rounded-lg p-8 bg-gray-50">
                <div className="text-center space-y-4">
                  {/* Placeholder for template preview */}
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-kifolio-cta to-kifolio-header rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {currentTemplate.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-kifolio-text">Sample Child Name</h4>
                    <p className="text-gray-600">Portfolio Title</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                    <div className="bg-white rounded p-3 text-center">
                      <div className="text-sm font-medium text-kifolio-text">Achievements</div>
                    </div>
                    <div className="bg-white rounded p-3 text-center">
                      <div className="text-sm font-medium text-kifolio-text">Milestones</div>
                    </div>
                  </div>
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