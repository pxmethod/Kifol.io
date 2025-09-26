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
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { Video, FileText, Music, Image } from 'lucide-react';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [existingMedia, setExistingMedia] = useState<Array<{id: string, url: string, fileName: string}>>([]);
  const [mediaPreview, setMediaPreview] = useState<{ url: string; file: File }[]>([]);
  const [loadingHighlight, setLoadingHighlight] = useState(true);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const highlightService = new HighlightService();
  const { uploadVideo, ...videoUploadState } = useVideoUpload();

  // Utility function to extract filename from URL
  const getFileNameFromUrl = (url: string): string => {
    try {
      // Try to extract from URL path
      const urlPath = new URL(url).pathname;
      const filename = urlPath.split('/').pop() || '';
      
      // If we got a filename, return it
      if (filename && filename.includes('.')) {
        return filename;
      }
      
      // Fallback: return a generic name
      return 'Media file';
    } catch (error) {
      // If URL parsing fails, try to extract from the string
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      return filename || 'Media file';
    }
  };

  // Utility function to detect file type from URL
  const getFileTypeFromUrl = (url: string): string => {
    const filename = getFileNameFromUrl(url);
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    // Check URL path for video indicators (some URLs might not have extensions)
    const urlLower = url.toLowerCase();
    
    // Video extensions
    if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'].includes(extension) || 
        urlLower.includes('video') || urlLower.includes('mp4')) {
      return 'video';
    }
    
    // Audio extensions
    if (['mp3', 'wav', 'aac', 'ogg', 'm4a'].includes(extension) || 
        urlLower.includes('audio')) {
      return 'audio';
    }
    
    // PDF
    if (extension === 'pdf' || urlLower.includes('pdf')) {
      return 'pdf';
    }
    
    // Image extensions
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension) || 
        urlLower.includes('image')) {
      return 'image';
    }
    
    // Default to video for unknown storage URLs (likely videos from our system)
    if (url.includes('storage') || url.includes('supabase')) {
      return 'video';
    }
    
    return 'image'; // fallback
  };

  // Icon mapping for highlight types
  const getTypeIcon = (type: HighlightType) => {
    switch (type) {
      case 'achievement':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'creative_work':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
        );
      case 'milestone':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'activity':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'reflection_note':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getSelectedType = () => {
    return HIGHLIGHT_TYPES.find(type => type.id === formData.type);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?message=Please log in to edit highlights');
    }
  }, [user, loading, router]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      mediaPreview.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.type-dropdown')) {
        setIsTypeDropdownOpen(false);
      }
    };

    if (isTypeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTypeDropdownOpen]);

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
      const newPreviews: { url: string; file: File }[] = [];
      
      for (const file of files) {
        // Handle video files with compression
        if (file.type.startsWith('video/')) {
          try {
            const uploadedUrl = await uploadVideo(file);
            // Create a special file object with the uploaded URL
            const videoFile = Object.assign(file, { uploadedUrl });
            uploadedFiles.push(videoFile);
            
            // Create preview for video
            newPreviews.push({
              url: URL.createObjectURL(file),
              file: videoFile
            });
          } catch (videoError) {
            console.error('Video upload error:', videoError);
            setErrors(prev => ({ 
              ...prev, 
              media: 'Failed to upload video. Please try again.' 
            }));
            continue;
          }
        } else {
          // Validate non-video files
          const validation = storageService.validateFile(file);
          if (!validation.valid) {
            setErrors(prev => ({ ...prev, media: validation.error || 'Invalid file' }));
            return;
          }
          
          uploadedFiles.push(file);
          
          // Create preview URL for images
          if (file.type.startsWith('image/')) {
            newPreviews.push({
              url: URL.createObjectURL(file),
              file
            });
          }
        }
      }

      setFormData(prev => ({ ...prev, media: [...prev.media, ...uploadedFiles] }));
      setMediaPreview(prev => [...prev, ...newPreviews]);
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
    // Clean up preview URL if it exists
    if (mediaPreview[index]) {
      URL.revokeObjectURL(mediaPreview[index].url);
    }
    
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
    
    setMediaPreview(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingMedia = (index: number) => {
    setExistingMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Process media files (videos are already uploaded, others need uploading)
      const mediaUrls: string[] = [];
      
      for (const file of formData.media) {
        // Check if this is a video that was already uploaded
        if ((file as any).uploadedUrl) {
          mediaUrls.push((file as any).uploadedUrl);
        } else {
          // Upload non-video files normally
          const url = await storageService.uploadFile(file, `${formData.title}-${Date.now()}`);
          mediaUrls.push(url);
        }
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

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    
    try {
      await highlightService.deleteHighlight(highlightId);
      router.push(`/portfolio/${portfolioId}?highlightDeleted=true`);
    } catch (error) {
      console.error('Error deleting highlight:', error);
      setErrors({ submit: 'Failed to delete highlight. Please try again.' });
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
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
          </div>

          <div className="card__body">
            <form onSubmit={handleSubmit} className="form">
              {/* Type Selection */}
              <div className="form-field">
                <label htmlFor="type" className="form-field__label form-field__label--required">
                  Type
                </label>
                <div className="type-dropdown relative">
                  <button
                    type="button"
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className={`w-full px-3 py-2 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-kifolio-cta input cursor-pointer ${
                      errors.type ? 'border-red-500' : 'border-gray-300'
                    } ${isTypeDropdownOpen ? 'ring-2 ring-kifolio-cta' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {formData.type && getTypeIcon(formData.type as HighlightType)}
                        <span className={`ml-2 ${formData.type ? 'text-gray-900' : 'text-gray-500'}`}>
                          {getSelectedType()?.name || 'Select a type...'}
                        </span>
                      </div>
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {isTypeDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      {HIGHLIGHT_TYPES.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            handleInputChange('type', type.id);
                            setIsTypeDropdownOpen(false);
                          }}
                          className="w-full px-3 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex items-center"
                        >
                          <div className="flex items-center">
                            {getTypeIcon(type.id)}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{type.name}</div>
                              <div className="text-xs text-gray-500">{type.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                  className="input cursor-pointer"
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
                <label className="form-field__label">
                  Add Media (Optional)
                </label>
                
                {/* File Input */}
                <div className="relative">
                  <input
                    type="file"
                    id="media"
                    multiple
                    accept="image/jpeg,image/png,image/gif,application/pdf,video/mp4,video/quicktime,audio/mpeg,audio/wav"
                    onChange={handleMediaUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingMedia}
                  />
                  <label
                    htmlFor="media"
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer transition-colors ${
                      uploadingMedia 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Choose files
                  </label>
                </div>
                
                <p className="form-field__help">
                  Photos, videos, PDFs, and audio files up to 50MB each. 
                </p>
                
                {/* Video Upload Progress */}
                {(videoUploadState.isUploading || videoUploadState.isCompressing) && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">
                        {videoUploadState.status}
                      </span>
                      <span className="text-sm text-blue-600">
                        {videoUploadState.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${videoUploadState.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {errors.media && (
                  <p className="form-field__error">{errors.media}</p>
                )}
              </div>

          {/* Media Preview */}
          {(formData.media.length > 0 || existingMedia.length > 0) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Media Preview</h3>
              <div className="grid grid-cols-4 gap-3">
                {/* Existing Media */}
                {existingMedia.map((media, index) => {
                  const fileType = getFileTypeFromUrl(media.url);
                  const filename = getFileNameFromUrl(media.url);
                  
                  return (
                    <div key={media.id} className="relative">
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {fileType === 'pdf' ? (
                          <div className="flex flex-col items-center justify-center text-center p-2">
                            <FileText className="w-8 h-8 text-red-500 mb-1" />
                            <span className="text-xs text-gray-500 truncate">{filename}</span>
                          </div>
                        ) : fileType === 'video' ? (
                          <div className="flex flex-col items-center justify-center text-center p-2">
                            <Video className="w-8 h-8 text-blue-500 mb-1" />
                            <span className="text-xs text-gray-500 truncate">{filename}</span>
                          </div>
                        ) : fileType === 'audio' ? (
                          <div className="flex flex-col items-center justify-center text-center p-2">
                            <Music className="w-8 h-8 text-green-500 mb-1" />
                            <span className="text-xs text-gray-500 truncate">{filename}</span>
                          </div>
                        ) : fileType === 'image' ? (
                          <img 
                            src={media.url} 
                            alt={filename}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="flex flex-col items-center justify-center text-center p-2">
                                    <svg class="w-8 h-8 text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span class="text-xs text-gray-500 truncate">${filename}</span>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-2">
                            <Image className="w-8 h-8 text-gray-500 mb-1" />
                            <span className="text-xs text-gray-500 truncate">{filename}</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingMedia(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
                
                {/* New Media */}
                {formData.media.map((file, index) => {
                  const preview = mediaPreview.find(p => p.file === file);
                  return (
                    <div key={index} className="relative">
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {file.type.startsWith('image/') && preview ? (
                          <img 
                            src={preview.url} 
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : file.type === 'application/pdf' ? (
                          <div className="flex flex-col items-center justify-center text-center p-2">
                            <FileText className="w-8 h-8 text-red-500 mb-1" />
                            <span className="text-xs text-gray-500 truncate">{file.name}</span>
                          </div>
                        ) : file.type.startsWith('video/') ? (
                          <div className="flex flex-col items-center justify-center text-center p-2 w-full h-full">
                            {/* Video thumbnail frame */}
                            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center mb-2">
                              <Video className="w-8 h-8 text-blue-500" />
                            </div>
                            {/* Filename and size below */}
                            <div className="text-center">
                              <div className="text-xs text-gray-700 font-medium truncate w-full" title={file.name}>
                                {file.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {(file.size / (1024 * 1024)).toFixed(1)} MB
                              </div>
                            </div>
                          </div>
                        ) : file.type.startsWith('audio/') ? (
                          <div className="flex flex-col items-center justify-center text-center p-2">
                            <Music className="w-8 h-8 text-green-500 mb-1" />
                            <span className="text-xs text-gray-500 truncate">{file.name}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-2">
                            <Image className="w-8 h-8 text-gray-500 mb-1" />
                            <span className="text-xs text-gray-500 truncate">{file.name}</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

              {/* Form Actions */}
              <div className="form-actions">
                <div className="flex justify-between items-center w-full">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn btn--danger"
                  >
                    Delete Highlight
                  </button>
                  <div className="flex space-x-3">
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
                </div>
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

      {/* Delete Confirmation Modal */}
      <ConfirmNavigationModal
        isOpen={showDeleteModal}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Highlight?"
        message="Are you sure you want to delete this highlight? This action cannot be undone."
      />
    </div>
  );
}
