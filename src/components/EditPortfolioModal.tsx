'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { storageService } from '@/lib/storage';

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

interface EditPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPortfolio: PortfolioData) => void;
  onDelete?: (portfolioId: string) => void;
  portfolio: PortfolioData | null;
}

export default function EditPortfolioModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  portfolio
}: EditPortfolioModalProps) {
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
  const [showPassword, setShowPassword] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [modalMode, setModalMode] = useState<'form' | 'delete-confirmation'>('form');

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
        template: portfolio.template,
        isPrivate: portfolio.isPrivate || false,
        password: portfolio.password || ''
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
      formData.template !== originalData.template ||
      formData.isPrivate !== originalData.isPrivate ||
      formData.password !== originalData.password
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

    if (formData.isPrivate && !formData.password.trim()) {
      newErrors.password = 'Password is required when portfolio is private';
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

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = storageService.validateFile(file);
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, photo: validation.error || 'Invalid file' }));
      return;
    }

    setUploadingPhoto(true);
    setErrors(prev => ({ ...prev, photo: '' }));

    try {
      // Delete old photo if it exists and is not a placeholder
      if (originalData.photoUrl && !originalData.photoUrl.includes('placeholders')) {
        await storageService.deleteFile(originalData.photoUrl);
      }

      // Upload new file to storage
      const photoUrl = await storageService.uploadFile(file, formData.childName || 'photo');
      setFormData(prev => ({ ...prev, photoUrl }));
    } catch (error) {
      console.error('Photo upload error:', error);
      setErrors(prev => ({ 
        ...prev, 
        photo: 'Failed to upload photo. Please try again.' 
      }));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePortfolio = () => {
    if (portfolio && onDelete) {
      onDelete(portfolio.id);
      setModalMode('form');
      onClose();
    }
  };

  const handleShowDeleteConfirmation = () => {
    setModalMode('delete-confirmation');
  };

  const handleCancelDelete = () => {
    setModalMode('form');
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
        template: formData.template,
        isPrivate: formData.isPrivate,
        password: formData.password,
        hasUnsavedChanges: true
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
            {modalMode === 'delete-confirmation' ? 'Delete Portfolio?' : 'Edit Portfolio'}
          </h2>
          <button
            onClick={modalMode === 'delete-confirmation' ? handleCancelDelete : onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {modalMode === 'delete-confirmation' ? (
            /* Delete Confirmation Content */
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-kifolio-text mb-2">
                Delete Portfolio?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this portfolio? This action cannot be undone and will remove all achievements.
              </p>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="flex-1 bg-gray-100 text-kifolio-text py-2 px-4 rounded-lg font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeletePortfolio}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700"
                >
                  Delete Portfolio
                </button>
              </div>
            </div>
          ) : (
            /* Form Content */
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
                disabled={uploadingPhoto}
              />
              {uploadingPhoto && (
                <div className="flex items-center mt-2">
                  <LoadingSpinner size="sm" className="mr-2" label="" />
                  <span className="text-sm text-kifolio-text">Uploading photo...</span>
                </div>
              )}
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

            {/* Delete Button */}
            {onDelete && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleShowDeleteConfirmation}
                  className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete Portfolio
                </button>
              </div>
            )}
          </form>
        )}
      </div>
      </div>
    </div>
  );
} 