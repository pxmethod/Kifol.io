'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import TemplatePreviewModal from '@/components/TemplatePreviewModal';
import ConfirmNavigationModal from '@/components/ConfirmNavigationModal';
import { getRandomPlaceholder } from '@/utils/placeholders';
import { usePortfolios } from '@/hooks/usePortfolios';

interface PortfolioData {
  id: string;
  childName: string;
  portfolioTitle: string;
  photoUrl: string;
  template: string;
  createdAt: string;
  isPrivate?: boolean;
  password?: string;
  hasUnsavedChanges?: boolean;
}

export default function CreatePortfolio() {
  const router = useRouter();
  const { createPortfolio } = usePortfolios();
  const [formData, setFormData] = useState({
    childName: '',
    portfolioTitle: '',
    photoUrl: '',
    template: '',
    isPrivate: false,
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<string>('');
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

    if (formData.isPrivate && !formData.password.trim()) {
      newErrors.password = 'Password is required when portfolio is private';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    return (
      formData.childName.trim() !== '' ||
      formData.portfolioTitle.trim() !== '' ||
      formData.photoUrl !== '' ||
      formData.template !== '' ||
      formData.isPrivate ||
      formData.password.trim() !== ''
    );
  };

  const handleBackClick = () => {
    if (hasChanges()) {
      setShowConfirmModal(true);
    } else {
      router.push('/');
    }
  };

  const handleConfirmNavigation = () => {
    setShowConfirmModal(false);
    router.push('/');
  };

  const handleCancelNavigation = () => {
    setShowConfirmModal(false);
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
        photoUrl: formData.photoUrl || getRandomPlaceholder(formData.childName),
        template: formData.template,
        isPrivate: formData.isPrivate,
        password: formData.password,
        hasUnsavedChanges: false,
        createdAt: new Date().toISOString()
      };

      // Create portfolio using the hook
      const newPortfolio = await createPortfolio({
        childName: portfolioData.childName,
        portfolioTitle: portfolioData.portfolioTitle,
        photoUrl: portfolioData.photoUrl,
        template: portfolioData.template,
        isPrivate: portfolioData.isPrivate,
        password: portfolioData.password
      });

      // Redirect to the new portfolio with success parameter
      router.push(`/portfolio/${newPortfolio.id}?created=true`);
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
      
      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-bar__container">
          <button
            onClick={handleBackClick}
            className="btn--back"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="card">
          <div className="card__header">
            <h1 className="card__title">Create New Portfolio</h1>
          </div>
          <div className="card__body">
            <form id="portfolioForm" onSubmit={handleSubmit} className="form">
            {/* Child's Name */}
            <div className="form-field">
              <label htmlFor="childName" className="form-field__label form-field__label--required">
                Child&apos;s Name
              </label>
              <input
                type="text"
                id="childName"
                value={formData.childName}
                onChange={(e) => handleInputChange('childName', e.target.value)}
                className={`input ${errors.childName ? 'input--error' : ''}`}
                placeholder="Enter your child's name"
                maxLength={100}
              />
              {errors.childName && (
                <p className="form-field__error">{errors.childName}</p>
              )}
              <p className="form-field__help">
                {formData.childName.length}/100 characters
              </p>
            </div>

            {/* Portfolio Title */}
            <div className="form-field">
              <label htmlFor="portfolioTitle" className="form-field__label form-field__label--required">
                Portfolio Title
              </label>
              <input
                type="text"
                id="portfolioTitle"
                value={formData.portfolioTitle}
                onChange={(e) => handleInputChange('portfolioTitle', e.target.value)}
                className={`input ${errors.portfolioTitle ? 'input--error' : ''}`}
                placeholder="Enter portfolio title"
                maxLength={100}
              />
              {errors.portfolioTitle && (
                <p className="form-field__error">{errors.portfolioTitle}</p>
              )}
              <p className="form-field__help">
                {formData.portfolioTitle.length}/100 characters
              </p>
            </div>

            {/* Photo Upload */}
            <div className="form-field">
              <label htmlFor="photo" className="form-field__label">
                Child&apos;s Photo (Optional)
              </label>
              <input
                type="file"
                id="photo"
                onChange={handlePhotoUpload}
                accept="image/jpeg,image/png,image/gif,image/svg+xml"
                className="input"
              />
              {errors.photo && (
                <p className="form-field__error">{errors.photo}</p>
              )}
              <p className="form-field__help">
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

            {/* Privacy Settings */}
            <div>
              <label className="block text-sm font-medium text-kifolio-text mb-2">
                Privacy Settings
              </label>
              <div className="space-y-4">
                {/* Privacy Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-kifolio-text">Private Portfolio</p>
                    <p className="text-sm text-gray-500">Require password to view this portfolio</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isPrivate ? 'bg-kifolio-cta' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isPrivate ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Password Input */}
                {formData.isPrivate && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-kifolio-text mb-2">
                      Portfolio Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kifolio-cta ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter portfolio password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </form>
          </div>
          <div className="card__footer">
            <div className="form-actions form-actions--center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn btn--primary btn--wide ${isSubmitting ? 'btn--loading' : ''}`}
                form="portfolioForm"
              >
                {isSubmitting ? 'Creating Portfolio...' : 'Create Portfolio'}
              </button>
            </div>
            {errors.submit && (
              <p className="form-field__error text-center mt-4">{errors.submit}</p>
            )}
          </div>
        </div>
      </main>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={(templateId) => handleInputChange('template', templateId)}
        selectedTemplate={selectedTemplateForPreview}
      />

      {/* Confirm Navigation Modal */}
      <ConfirmNavigationModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
        title="Discard Changes?"
        message="You will lose any changes you've made if you go back."
      />
    </div>
  );
} 