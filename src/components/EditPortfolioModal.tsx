'use client';

import { useState, useEffect } from 'react';

interface PortfolioData {
  id: string;
  childName: string;
  portfolioTitle: string;
  photoUrl: string;
  template: string;
  createdAt: string;
}

interface EditPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPortfolio: PortfolioData) => void;
  portfolio: PortfolioData | null;
}

export default function EditPortfolioModal({
  isOpen,
  onClose,
  onSave,
  portfolio
}: EditPortfolioModalProps) {
  const [formData, setFormData] = useState({
    childName: '',
    portfolioTitle: '',
    photoUrl: '',
    template: ''
  });
  const [originalData, setOriginalData] = useState({
    childName: '',
    portfolioTitle: '',
    photoUrl: '',
    template: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const templates = [
    { id: 'ren', name: 'Ren', description: 'Clean and modern design' },
    { id: 'maeve', name: 'Maeve', description: 'Elegant and sophisticated' },
    { id: 'jack', name: 'Jack', description: 'Bold and dynamic' },
    { id: 'adler', name: 'Adler', description: 'Classic and timeless' }
  ];

  // Populate form data when portfolio changes
  useEffect(() => {
    if (portfolio) {
      const data = {
        childName: portfolio.childName,
        portfolioTitle: portfolio.portfolioTitle,
        photoUrl: portfolio.photoUrl,
        template: portfolio.template
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [portfolio]);

  const hasChanges = () => {
    return (
      formData.childName !== originalData.childName ||
      formData.portfolioTitle !== originalData.portfolioTitle ||
      formData.photoUrl !== originalData.photoUrl ||
      formData.template !== originalData.template
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.childName.trim()) {
      newErrors.childName = 'Child&apos;s name is required';
    } else if (formData.childName.length > 100) {
      newErrors.childName = 'Child&apos;s name must be 100 characters or less';
    }

    if (!formData.portfolioTitle.trim()) {
      newErrors.portfolioTitle = 'Portfolio title is required';
    } else if (formData.portfolioTitle.length > 100) {
      newErrors.portfolioTitle = 'Portfolio title must be 100 characters or less';
    }

    if (!formData.template) {
      newErrors.template = 'Please select a template';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: 'File size must be 2MB or less' }));
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, photo: 'Please upload a JPEG, PNG, GIF, or SVG file' }));
        return;
      }

      // Create a local URL for preview (in real app, this would upload to server)
      const photoUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, photoUrl }));
      setErrors(prev => ({ ...prev, photo: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !portfolio) return;

    setIsSubmitting(true);

    try {
      const updatedPortfolio: PortfolioData = {
        ...portfolio,
        childName: formData.childName,
        portfolioTitle: formData.portfolioTitle,
        photoUrl: formData.photoUrl,
        template: formData.template
      };

      onSave(updatedPortfolio);
      onClose();
    } catch (error) {
      console.error('Error updating portfolio:', error);
      setErrors({ submit: 'Failed to update portfolio. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !portfolio) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-kifolio-text">
            Edit Portfolio
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

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Child's Name */}
            <div>
              <label htmlFor="editChildName" className="block text-sm font-medium text-kifolio-text mb-2">
                Child&apos;s Name *
              </label>
              <input
                type="text"
                id="editChildName"
                value={formData.childName}
                onChange={(e) => handleInputChange('childName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kifolio-cta ${
                  errors.childName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your child's name"
                maxLength={100}
              />
              {errors.childName && (
                <p className="text-red-500 text-sm mt-1">{errors.childName}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {formData.childName.length}/100 characters
              </p>
            </div>

            {/* Portfolio Title */}
            <div>
              <label htmlFor="editPortfolioTitle" className="block text-sm font-medium text-kifolio-text mb-2">
                Portfolio Title *
              </label>
              <input
                type="text"
                id="editPortfolioTitle"
                value={formData.portfolioTitle}
                onChange={(e) => handleInputChange('portfolioTitle', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kifolio-cta ${
                  errors.portfolioTitle ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter portfolio title"
                maxLength={100}
              />
              {errors.portfolioTitle && (
                <p className="text-red-500 text-sm mt-1">{errors.portfolioTitle}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {formData.portfolioTitle.length}/100 characters
              </p>
            </div>

            {/* Photo Upload */}
            <div>
              <label htmlFor="editPhoto" className="block text-sm font-medium text-kifolio-text mb-2">
                Child&apos;s Photo (Optional)
              </label>
              <input
                type="file"
                id="editPhoto"
                onChange={handlePhotoUpload}
                accept="image/jpeg,image/png,image/gif,image/svg+xml"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kifolio-cta"
              />
              {errors.photo && (
                <p className="text-red-500 text-sm mt-1">{errors.photo}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                JPEG, PNG, GIF, or SVG up to 2MB
              </p>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-kifolio-text mb-2">
                Portfolio Template *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.template === template.id
                        ? 'border-kifolio-cta bg-kifolio-cta/5'
                        : 'border-gray-300 hover:border-kifolio-cta/50'
                    }`}
                    onClick={() => handleInputChange('template', template.id)}
                  >
                    <div className="text-center">
                      <h3 className="font-semibold text-kifolio-text">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              {errors.template && (
                <p className="text-red-500 text-sm mt-1">{errors.template}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !hasChanges()}
                className="w-full bg-kifolio-cta text-white py-3 px-6 rounded-lg font-semibold hover:bg-kifolio-cta/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
              {errors.submit && (
                <p className="text-red-500 text-sm mt-2 text-center">{errors.submit}</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 