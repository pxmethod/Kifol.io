'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import TemplatePreviewModal from '@/components/TemplatePreviewModal';

interface PortfolioData {
  id: string;
  childName: string;
  portfolioTitle: string;
  photoUrl: string;
  template: string;
  createdAt: string;
}

export default function CreatePortfolio() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    childName: '',
    portfolioTitle: '',
    photoUrl: '',
    template: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<string>('');

  const templates = [
    { id: 'ren', name: 'Ren', description: 'Clean and modern design' },
    { id: 'maeve', name: 'Maeve', description: 'Elegant and sophisticated' },
    { id: 'jack', name: 'Jack', description: 'Bold and dynamic' },
    { id: 'adler', name: 'Adler', description: 'Classic and timeless' }
  ];

  const generatePortfolioId = (childName: string) => {
    const cleanName = childName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.floor(Math.random() * 9000) + 1000; // 4-digit number
    return `${cleanName}${randomSuffix}`;
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
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const portfolioId = generatePortfolioId(formData.childName);
      const portfolioData: PortfolioData = {
        id: portfolioId,
        childName: formData.childName,
        portfolioTitle: formData.portfolioTitle,
        photoUrl: formData.photoUrl,
        template: formData.template,
        createdAt: new Date().toISOString()
      };

      // Save to local storage
      const existingPortfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
      existingPortfolios.push(portfolioData);
      localStorage.setItem('portfolios', JSON.stringify(existingPortfolios));

      // Redirect to the new portfolio
      router.push(`/portfolio/${portfolioId}`);
    } catch (error) {
      console.error('Error creating portfolio:', error);
      setErrors({ submit: 'Failed to create portfolio. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-kifolio-bg">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-kifolio-text mb-6">Create New Portfolio</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Child's Name */}
            <div>
              <label htmlFor="childName" className="block text-sm font-medium text-kifolio-text mb-2">
                Child&apos;s Name *
              </label>
              <input
                type="text"
                id="childName"
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
              <label htmlFor="portfolioTitle" className="block text-sm font-medium text-kifolio-text mb-2">
                Portfolio Title *
              </label>
              <input
                type="text"
                id="portfolioTitle"
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
              <label htmlFor="photo" className="block text-sm font-medium text-kifolio-text mb-2">
                Child&apos;s Photo (Optional)
              </label>
              <input
                type="file"
                id="photo"
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
                      <div className="mt-3 space-y-2">
                        <button
                          type="button"
                          className="w-full px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplateForPreview(template.id);
                            setShowTemplateModal(true);
                          }}
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          className="w-full px-3 py-1 text-xs bg-kifolio-cta text-white rounded hover:bg-kifolio-cta/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInputChange('template', template.id);
                          }}
                        >
                          Select
                        </button>
                      </div>
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
                disabled={isSubmitting}
                className="w-full bg-kifolio-cta text-white py-3 px-6 rounded-lg font-semibold hover:bg-kifolio-cta/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Portfolio...' : 'Create Portfolio'}
              </button>
              {errors.submit && (
                <p className="text-red-500 text-sm mt-2 text-center">{errors.submit}</p>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={(templateId) => handleInputChange('template', templateId)}
        selectedTemplate={selectedTemplateForPreview}
      />
    </div>
  );
} 