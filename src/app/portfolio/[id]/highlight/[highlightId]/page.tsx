'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import ConfirmNavigationModal from '@/components/ConfirmNavigationModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { storageService } from '@/lib/storage';
import { HighlightService } from '@/lib/database/achievements';
import { HIGHLIGHT_TYPES, HighlightType, HighlightFormData } from '@/types/achievement';

export default function EditHighlight() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const portfolioId = params.id as string;
  const highlightId = params.highlightId as string;
  
  const [formData, setFormData] = useState<HighlightFormData>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: '' as HighlightType,
    media: []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [existingMedia, setExistingMedia] = useState<Array<{id: string, url: string, fileName: string}>>([]);
  const [loadingHighlight, setLoadingHighlight] = useState(true);

  const highlightService = new HighlightService();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?message=Please log in to edit highlights');
    }
  }, [user, loading, router]);

  // Load existing highlight data
  useEffect(() => {
    if (highlightId && user) {
      loadExistingHighlight();
    }
  }, [highlightId, user]);

  const loadExistingHighlight = async () => {
    try {
      setLoadingHighlight(true);
      const highlight = await highlightService.getHighlight(highlightId);
      if (highlight) {
        setFormData({
          title: highlight.title,
          date: highlight.date_achieved.split('T')[0],
          description: highlight.description || '',
          type: highlight.type as HighlightType,
          media: []
        });
        setExistingMedia(highlight.media_urls.map((url, index) => ({
          id: `existing-${index}`,
          url,
          fileName: `Media ${index + 1}`
        })));
      } else {
        // Highlight not found, redirect back
        router.push(`/portfolio/${portfolioId}`);
      }
    } catch (error) {
      console.error('Error loading highlight:', error);
      setErrors({ submit: 'Failed to load highlight data' });
    } finally {
      setLoadingHighlight(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (!formData.type) {
      newErrors.type = 'Please select a highlight type';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    return (
      formData.title.trim() !== '' ||
      formData.description.trim() !== '' ||
      formData.type !== ('' as HighlightType) ||
      formData.media.length > 0 ||
      existingMedia.length > 0
    );
  };

  const handleBackClick = () => {
    if (hasChanges()) {
      setShowConfirmModal(true);
    } else {
      router.push(`/portfolio/${portfolioId}`);
    }
  };

  const handleConfirmNavigation = () => {
    setShowConfirmModal(false);
    router.push(`/portfolio/${portfolioId}`);
  };

  const handleInputChange = (field: keyof HighlightFormData, value: string | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadingMedia(true);
    setErrors(prev => ({ ...prev, media: '' }));

    try {
      const uploadedFiles: File[] = [];
      
      for (const file of files) {
        // Validate file
        const validation = storageService.validateFile(file);
        if (!validation.valid) {
          setErrors(prev => ({ ...prev, media: validation.error || 'Invalid file' }));
          return;
        }
        
        uploadedFiles.push(file);
      }

      setFormData(prev => ({ ...prev, media: [...prev.media, ...uploadedFiles] }));
    } catch (error) {
      console.error('Media upload error:', error);
      setErrors(prev => ({ 
        ...prev, 
        media: 'Failed to upload media. Please try again.' 
      }));
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const removeExistingMedia = (index: number) => {
    setExistingMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Upload media files
      const mediaUrls: string[] = [];
      
      for (const file of formData.media) {
        const url = await storageService.uploadFile(file, `${formData.title}-${Date.now()}`);
        mediaUrls.push(url);
      }

      // Combine existing media URLs with new ones
      const allMediaUrls = [...existingMedia.map(m => m.url), ...mediaUrls];

      const highlightData = {
        portfolio_id: portfolioId,
        title: formData.title,
        description: formData.description || null,
        date_achieved: formData.date,
        media_urls: allMediaUrls,
        type: formData.type,
        category: null // We can add category later if needed
      };

      await highlightService.updateHighlight(highlightId, highlightData);

      // Redirect back to portfolio
      router.push(`/portfolio/${portfolioId}?highlightUpdated=true`);
    } catch (error) {
      console.error('Error updating highlight:', error);
      setErrors({ submit: 'Failed to update highlight. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this highlight? This action cannot be undone.')) {
      return;
    }

    try {
      await highlightService.deleteHighlight(highlightId);
      router.push(`/portfolio/${portfolioId}?highlightDeleted=true`);
    } catch (error) {
      console.error('Error deleting highlight:', error);
      setErrors({ submit: 'Failed to delete highlight. Please try again.' });
    }
  };

  // Show loading while checking authentication or loading highlight
  if (loading || loadingHighlight) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // Will redirect
  }

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
            Back to Portfolio
          </button>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="card">
          <div className="card__header">
            <h1 className="card__title">
              Edit Highlight
            </h1>
            <p className="text-gray-600 mt-2">
              Update your child's highlight details
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleDelete}
                className="btn btn--danger"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="card__body">
            <form onSubmit={handleSubmit} className="form">
              {/* Type Selection */}
              <div className="form-field">
                <label htmlFor="type" className="form-field__label form-field__label--required">
                  Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as HighlightType)}
                  className="input select"
                >
                  <option value="">Select a type...</option>
                  {HIGHLIGHT_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} – {type.description}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="form-field__error">{errors.type}</p>
                )}
              </div>

              {/* Title */}
              <div className="form-field">
                <label htmlFor="title" className="form-field__label form-field__label--required">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., First Piano Recital"
                  maxLength={100}
                  className="input"
                />
                {errors.title && (
                  <p className="form-field__error">{errors.title}</p>
                )}
                <p className="form-field__help">
                  {formData.title.length}/100 characters
                </p>
              </div>

              {/* Date */}
              <div className="form-field">
                <label htmlFor="date" className="form-field__label form-field__label--required">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="input"
                />
                {errors.date && (
                  <p className="form-field__error">{errors.date}</p>
                )}
              </div>

              {/* Description */}
              <div className="form-field">
                <label htmlFor="description" className="form-field__label">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Ex: they practiced for weeks to get this piano piece right—so proud!"
                  rows={4}
                  maxLength={500}
                  className="input textarea"
                />
                {errors.description && (
                  <p className="form-field__error">{errors.description}</p>
                )}
                <p className="form-field__help">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Media Upload */}
              <div className="form-field">
                <label htmlFor="media" className="form-field__label">
                  Add Media (Optional)
                </label>
                <input
                  type="file"
                  id="media"
                  multiple
                  accept="image/jpeg,image/png,image/gif,application/pdf"
                  onChange={handleMediaUpload}
                  className="input"
                />
                <p className="form-field__help">
                  JPEG, PNG, GIF, or PDF up to 15MB each
                </p>
                {errors.media && (
                  <p className="form-field__error">{errors.media}</p>
                )}
              </div>

          {/* Media Preview */}
          {(formData.media.length > 0 || existingMedia.length > 0) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Media Preview</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Existing Media */}
                {existingMedia.map((media, index) => (
                  <div key={media.id} className="relative">
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-gray-500">{media.fileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingMedia(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {/* New Media */}
                {formData.media.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-gray-500">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

              {/* Submit Button */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleBackClick}
                  className="btn btn--secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingMedia}
                  className="btn btn--primary"
                >
                  {isSubmitting ? 'Updating...' : 'Update Highlight'}
                </button>
              </div>

              {errors.submit && (
                <p className="form-field__error text-center">{errors.submit}</p>
              )}
            </form>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <ConfirmNavigationModal
        isOpen={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmNavigation}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
      />
    </div>
  );
}
