'use client';

import { useState, useEffect } from 'react';
import { Achievement, AchievementFormData, AchievementModalProps } from '@/types/achievement';

export default function AchievementModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  achievement
}: AchievementModalProps) {
  const [formData, setFormData] = useState<AchievementFormData>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isMilestone: false,
    media: []
  });
  const [originalData, setOriginalData] = useState<AchievementFormData>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isMilestone: false,
    media: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ url: string; file: File }[]>([]);
  const [existingMedia, setExistingMedia] = useState<Achievement['media']>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [modalMode, setModalMode] = useState<'form' | 'delete-confirmation'>('form');

  const isEditing = !!achievement;

  // Populate form data when achievement changes
  useEffect(() => {
    setModalMode('form'); // Reset to form mode when achievement changes
    if (achievement) {
      const data: AchievementFormData = {
        title: achievement.title,
        date: achievement.date.split('T')[0],
        description: achievement.description || '',
        isMilestone: achievement.isMilestone,
        media: []
      };
      setFormData(data);
      setOriginalData(data);
      setExistingMedia(achievement.media);
    } else {
      // Reset form for new achievement
      const defaultData: AchievementFormData = {
        title: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        isMilestone: false,
        media: []
      };
      setFormData(defaultData);
      setOriginalData(defaultData);
      setMediaPreview([]);
      setExistingMedia([]);
    }
  }, [achievement]);

  const hasChanges = () => {
    return (
      formData.title !== originalData.title ||
      formData.date !== originalData.date ||
      formData.description !== originalData.description ||
      formData.isMilestone !== originalData.isMilestone ||
      formData.media.length > 0 ||
      existingMedia.length !== (achievement?.media.length || 0)
    );
  };

  const handleDeleteAchievement = () => {
    if (achievement) {
      // Call the onDelete prop if it exists
      if (onDelete) {
        onDelete(achievement.id);
      }
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    // Validate media files
    formData.media.forEach((file, index) => {
      const maxSize = 15 * 1024 * 1024; // 15MB
      if (file.size > maxSize) {
        newErrors[`media-${index}`] = 'File size must be 15MB or less';
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        newErrors[`media-${index}`] = 'Please upload JPEG, PNG, GIF, or PDF files only';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      const maxSize = 15 * 1024 * 1024; // 15MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, media: 'File size must be 15MB or less' }));
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, media: 'Please upload JPEG, PNG, GIF, or PDF files only' }));
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setFormData(prev => ({ ...prev, media: [...prev.media, ...validFiles] }));
      setErrors(prev => ({ ...prev, media: '' }));

      // Create preview URLs for images
      const newPreviews = validFiles
        .filter(file => file.type.startsWith('image/'))
        .map(file => ({
          url: URL.createObjectURL(file),
          file
        }));
      
      setMediaPreview(prev => [...prev, ...newPreviews]);
    }
  };

  const removeMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));

    // Remove preview if it exists
    if (mediaPreview[index]) {
      URL.revokeObjectURL(mediaPreview[index].url);
      setMediaPreview(prev => prev.filter((_, i) => i !== index));
    }
  };

  const removeExistingMedia = (index: number) => {
    setExistingMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Process media files
      const processedMedia = await Promise.all(
        formData.media.map(async (file, index) => {
          // In a real app, this would upload to a server
          // For now, we'll create a local URL
          const url = file.type.startsWith('image/') 
            ? mediaPreview.find(p => p.file === file)?.url || URL.createObjectURL(file)
            : URL.createObjectURL(file);

          return {
            id: `${Date.now()}-${index}`,
            url,
            type: file.type.startsWith('image/') ? 'image' as const : 'pdf' as const,
            fileName: file.name,
            fileSize: file.size
          };
        })
      );

      const newAchievement: Achievement = {
        id: achievement?.id || `achievement-${Date.now()}`,
        title: formData.title,
        date: formData.date,
        description: formData.description,
        media: [...existingMedia, ...processedMedia],
        isMilestone: formData.isMilestone,
        createdAt: achievement?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onSave(newAchievement);
      onClose();
    } catch (error) {
      console.error('Error saving achievement:', error);
      setErrors({ submit: 'Failed to save achievement. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-kifolio-text">
            {modalMode === 'delete-confirmation' 
              ? 'Remove Achievement?' 
              : (isEditing ? 'Edit Achievement' : 'Add Achievement')
            }
          </h2>
          <button
            onClick={modalMode === 'delete-confirmation' ? handleCancelDelete : onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {modalMode === 'delete-confirmation' ? (
            /* Delete Confirmation Content */
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-kifolio-text mb-2">
                Remove Achievement?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove this achievement? This action cannot be undone.
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
                  onClick={handleDeleteAchievement}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            /* Form Content */
            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="achievementTitle" className="block text-sm font-medium text-kifolio-text mb-2">
                Title *
              </label>
              <input
                type="text"
                id="achievementTitle"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kifolio-cta ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter achievement title"
                maxLength={100}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="achievementDate" className="block text-sm font-medium text-kifolio-text mb-2">
                Date *
              </label>
              <input
                type="date"
                id="achievementDate"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-kifolio-cta ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="achievementDescription" className="block text-sm font-medium text-kifolio-text mb-2">
                Description (Optional)
              </label>
              <textarea
                id="achievementDescription"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kifolio-cta"
                placeholder="Add details about this achievement..."
                rows={3}
                maxLength={500}
              />
              <p className="text-gray-500 text-sm mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Milestone Toggle */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-kifolio-text">Mark as Milestone</p>
                <p className="text-xs text-gray-500">Special achievements that mark important progress</p>
              </div>
              <button
                type="button"
                onClick={() => handleInputChange('isMilestone', !formData.isMilestone)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isMilestone ? 'bg-kifolio-cta' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isMilestone ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Media Upload */}
            <div>
              <label htmlFor="achievementMedia" className="block text-sm font-medium text-kifolio-text mb-2">
                Add Media (Optional)
              </label>
              <input
                type="file"
                id="achievementMedia"
                onChange={handleMediaUpload}
                accept="image/jpeg,image/png,image/gif,application/pdf"
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kifolio-cta"
              />
              {errors.media && (
                <p className="text-red-500 text-sm mt-1">{errors.media}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                JPEG, PNG, GIF, or PDF up to 15MB each
              </p>
            </div>

            {/* Media Preview */}
            {formData.media.length > 0 && (
              <div>
                <p className="text-sm font-medium text-kifolio-text mb-2">Selected Files:</p>
                <div className="space-y-2">
                  {formData.media.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        {file.type.startsWith('image/') ? (
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        )}
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Media (for editing) */}
            {isEditing && (
              <div>
                <p className="text-sm font-medium text-kifolio-text mb-2">Current Media:</p>
                {existingMedia.length > 0 ? (
                  <div className="space-y-2">
                    {existingMedia.map((media, index) => (
                      <div key={media.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <div className="flex items-center space-x-2">
                          {media.type === 'image' ? (
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                          <span className="text-sm text-gray-700 truncate">{media.fileName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingMedia(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No media files attached</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !hasChanges()}
                className="w-full bg-kifolio-cta text-white py-3 px-6 rounded-lg font-semibold hover:bg-kifolio-cta/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update Achievement' : 'Add Achievement')}
              </button>
              {errors.submit && (
                <p className="text-red-500 text-sm mt-2 text-center">{errors.submit}</p>
              )}
            </div>

            {/* Delete Button (only for editing) */}
            {isEditing && onDelete && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleShowDeleteConfirmation}
                  className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Remove Achievement
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