'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import TemplatePreviewModal from '@/components/TemplatePreviewModal';
import ConfirmNavigationModal from '@/components/ConfirmNavigationModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getRandomPlaceholder } from '@/utils/placeholders';
import { usePortfolios } from '@/hooks/usePortfolios';
import { useAuth } from '@/contexts/AuthContext';
import { storageService } from '@/lib/storage';
import { portfolioService } from '@/lib/database';

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

export default function EditPortfolio() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const { savePortfolio } = usePortfolios();
  const portfolioId = params.id as string;
  
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [formData, setFormData] = useState({
    childName: '',
    portfolioTitle: '',
    photoUrl: '',
    template: '',
    isPrivate: false,
    password: ''
  });
  const [originalData, setOriginalData] = useState({
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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);

  const templates = [
    { id: 'ren', name: 'Ren', description: 'Clean and modern design' },
    { id: 'maeve', name: 'Maeve', description: 'Elegant and sophisticated' },
    { id: 'jack', name: 'Jack', description: 'Bold and dynamic' },
    { id: 'adler', name: 'Adler', description: 'Classic and timeless' }
  ];

  // Load portfolio data
  useEffect(() => {
    const loadPortfolio = async () => {
      if (!user || !portfolioId) return;
      
      try {
        setLoadingPortfolio(true);
        const portfolioData = await portfolioService.getPortfolio(portfolioId);
        
        if (!portfolioData) {
          router.push('/dashboard');
          return;
        }

        const portfolioInfo: PortfolioData = {
          id: portfolioData.id,
          childName: portfolioData.child_name,
          portfolioTitle: portfolioData.portfolio_title,
          photoUrl: portfolioData.photo_url || '',
          template: portfolioData.template,
          createdAt: portfolioData.created_at,
          isPrivate: portfolioData.is_private || false,
          password: portfolioData.password || ''
        };

        setPortfolio(portfolioInfo);
        setFormData({
          childName: portfolioInfo.childName,
          portfolioTitle: portfolioInfo.portfolioTitle,
          photoUrl: portfolioInfo.photoUrl,
          template: portfolioInfo.template,
          isPrivate: portfolioInfo.isPrivate || false,
          password: portfolioInfo.password || ''
        });
        setOriginalData({
          childName: portfolioInfo.childName,
          portfolioTitle: portfolioInfo.portfolioTitle,
          photoUrl: portfolioInfo.photoUrl,
          template: portfolioInfo.template,
          isPrivate: portfolioInfo.isPrivate || false,
          password: portfolioInfo.password || ''
        });
      } catch (error) {
        console.error('Error loading portfolio:', error);
        router.push('/dashboard');
      } finally {
        setLoadingPortfolio(false);
      }
    };

    loadPortfolio();
  }, [user, portfolioId, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?message=Please log in to edit portfolio');
    }
  }, [user, loading, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.childName.trim()) {
      newErrors.childName = 'Child\'s name is required';
    } else if (formData.childName.length > 100) {
      newErrors.childName = 'Child\'s name must be 100 characters or less';
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
      formData.childName !== originalData.childName ||
      formData.portfolioTitle !== originalData.portfolioTitle ||
      formData.photoUrl !== originalData.photoUrl ||
      formData.template !== originalData.template ||
      formData.isPrivate !== originalData.isPrivate ||
      formData.password !== originalData.password
    );
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photoUrl: 'File size must be less than 50MB' }));
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, photoUrl: 'Please upload a valid image file (JPEG, PNG, GIF, WebP)' }));
      return;
    }

    setUploadingPhoto(true);
    setSelectedFile(file);

    try {
      const photoUrl = await storageService.uploadFile(file, 'portfolio-photo');
      setFormData(prev => ({ ...prev, photoUrl }));
      setErrors(prev => ({ ...prev, photoUrl: '' }));
    } catch (error) {
      console.error('Error uploading photo:', error);
      setErrors(prev => ({ ...prev, photoUrl: 'Failed to upload photo' }));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setFormData(prev => ({ ...prev, template: templateId }));
    setShowTemplateModal(false);
  };

  const handlePreviewTemplate = (templateId: string) => {
    setSelectedTemplateForPreview(templateId);
    setShowTemplateModal(true);
  };

  const handleSave = async () => {
    if (!validateForm() || !portfolio) return;

    setIsSubmitting(true);
    try {
      const updatedPortfolio = {
        ...portfolio,
        childName: formData.childName,
        portfolioTitle: formData.portfolioTitle,
        photoUrl: formData.photoUrl,
        template: formData.template,
        isPrivate: formData.isPrivate,
        password: formData.password
      };

      await savePortfolio(updatedPortfolio);
      router.push(`/portfolio/${portfolioId}`);
    } catch (error) {
      console.error('Error updating portfolio:', error);
      setErrors({ general: 'Failed to update portfolio. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (hasChanges()) {
      setShowConfirmModal(true);
    } else {
      router.push(`/portfolio/${portfolioId}`);
    }
  };

  const handleConfirmLeave = () => {
    setShowConfirmModal(false);
    router.push(`/portfolio/${portfolioId}`);
  };

  const handleCancelLeave = () => {
    setShowConfirmModal(false);
  };

  // Show loading while checking authentication or loading portfolio
  if (loading || loadingPortfolio) {
    return (
      <div className="min-h-screen bg-kifolio-bg">
        <Header animateLogo={true} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" label="Loading..." />
          </div>
        </main>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-kifolio-bg">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Portfolio not found</h1>
              <p className="text-gray-600 mb-6">The portfolio you're looking for doesn't exist or you don't have permission to edit it.</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="btn btn--primary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kifolio-bg">
      <Header />
      
      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-bar__container">
          <button
            onClick={handleBack}
            className="btn--back"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to portfolio
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="card">
          <div className="card__header">
            <h1 className="card__title">Edit portfolio</h1>
          </div>
          <div className="card__body">
            <form id="portfolioForm" onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="form">
              {/* Child's Name */}
              <div className="form-field">
                <label htmlFor="childName" className="form-field__label form-field__label--required">
                  Child&apos;s name
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
                  Portfolio title
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
                <label className="form-field__label">
                  Child&apos;s photo (totally optional)
                </label>
                
                {/* File Input */}
                <div className="relative">
                  <input
                    type="file"
                    id="photo"
                    onChange={handlePhotoUpload}
                    accept="image/jpeg,image/png,image/gif,image/svg+xml"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingPhoto}
                  />
                  <label
                    htmlFor="photo"
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer transition-colors ${
                      uploadingPhoto 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {selectedFile ? 'Replace photo' : 'Choose file'}
                  </label>
                </div>
                
                {/* Photo Preview */}
                {selectedFile && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Selected photo preview"
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFormData(prev => ({ ...prev, photoUrl: '' }));
                          const fileInput = document.getElementById('photo') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Current Photo Display */}
                {formData.photoUrl && !selectedFile && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <img
                          src={formData.photoUrl}
                          alt="Current portfolio photo"
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Current photo</p>
                        <p className="text-sm text-gray-500">Click "Choose file" to replace</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                {uploadingPhoto && (
                  <div className="flex items-center mt-2">
                    <LoadingSpinner size="sm" className="mr-2" label="" />
                    <span className="text-sm text-kifolio-text">Uploading photo...</span>
                  </div>
                )}
                {errors.photoUrl && (
                  <p className="form-field__error">{errors.photoUrl}</p>
                )}
                <p className="form-field__help">
                  JPEG, PNG, GIF, or SVG. Max size of 50MB
                </p>
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-kifolio-text mb-2">
                  Choose a template *
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
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <div className="text-center">
                        {/* Template Image */}
                        <div className="mb-3">
                          <img
                            src={`/marketing/template_${template.id}.png`}
                            alt={`${template.name} template preview`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                        
                        {/* Template Name */}
                        <h3 className="font-semibold text-kifolio-text">{template.name}</h3>
                        
                        {/* Template Description */}
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        
                        {/* Action Buttons */}
                        <div className="mt-3 space-y-2">
                          <button
                            type="button"
                            className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewTemplate(template.id);
                            }}
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            className="w-full px-4 py-2 text-sm bg-kifolio-cta text-white rounded hover:bg-kifolio-cta/90 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTemplateSelect(template.id);
                            }}
                          >
                            Choose
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
                  Privacy settings
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
                        Portfolio password *
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
            <div className="form-actions form-actions--right">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn btn--secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !hasChanges()}
                  className={`btn btn--primary ${isSubmitting ? 'btn--loading' : ''}`}
                  form="portfolioForm"
                >
                  {isSubmitting ? 'Saving changes...' : 'Save changes'}
                </button>
              </div>
            </div>
            {errors.general && (
              <p className="form-field__error text-center mt-4">{errors.general}</p>
            )}
          </div>
        </div>
      </main>

      {/* Template Preview Modal */}
      {showTemplateModal && (
        <TemplatePreviewModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onSelect={handleTemplateSelect}
          selectedTemplate={selectedTemplateForPreview}
        />
      )}

      {/* Confirm Navigation Modal */}
      {showConfirmModal && (
        <ConfirmNavigationModal
          isOpen={showConfirmModal}
          onCancel={handleCancelLeave}
          onConfirm={handleConfirmLeave}
          title="Unsaved changes"
          message="You have unsaved changes. Are you sure you want to leave without saving?"
        />
      )}
    </div>
  );
}
