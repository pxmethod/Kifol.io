'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { storageService } from '@/lib/storage';
import { HighlightService } from '@/lib/database/achievements';
import { deriveTypeAndCustomLabelFromHighlightRow } from '@/lib/highlightDbRow';
import { HighlightType, HighlightFormData } from '@/types/achievement';
import { FormFieldError } from '@/components/forms/FormFieldError';
import HighlightMetadataSection from '@/components/highlight/HighlightMetadataSection';
import { submitEndorsementInviteRequest } from '@/lib/endorsementInviteRequest';
import { validateHighlightMetadata } from '@/lib/highlightFormValidation';
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
    dateEnd: '',
    ongoing: false,
    customTypeLabel: '',
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
  const [endorsementData, setEndorsementData] = useState({
    instructorName: '',
    instructorEmail: '',
    relationship: '',
  });

  const highlightService = new HighlightService();

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
        const { type, customTypeLabel } = deriveTypeAndCustomLabelFromHighlightRow(highlight);
        setFormData({
          title: highlight.title,
          date: highlight.date_achieved.split('T')[0],
          dateEnd: highlight.date_end ? highlight.date_end.split('T')[0] : '',
          ongoing: highlight.ongoing ?? (highlight.date_end ? false : true),
          customTypeLabel: customTypeLabel ?? '',
          description: highlight.description || '',
          type,
          media: []
        });
        setExistingMedia((highlight.media_urls || []).map((url, index) => ({
          id: `existing-${index}`,
          url,
          fileName: getFileNameFromUrl(url),
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

    Object.assign(newErrors, validateHighlightMetadata(formData));

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
      formData.dateEnd !== '' ||
      formData.ongoing ||
      formData.customTypeLabel.trim() !== '' ||
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

  const handleInputChange = (field: keyof HighlightFormData, value: string | File[] | boolean) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value } as HighlightFormData;
      if (field === 'ongoing' && value === true) {
        next.dateEnd = '';
      }
      if (field === 'type' && value !== 'custom') {
        next.customTypeLabel = '';
      }
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
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
        const validation = storageService.validateFile(file);
        if (!validation.valid) {
          setErrors(prev => ({ ...prev, media: validation.error || 'Invalid file' }));
          return;
        }
        
        uploadedFiles.push(file);
        
        // Create preview URL for images
        if (file.type.startsWith('image/')) {
            try {
              // Use FileReader to create data URL (more reliable than blob URL)
              const reader = new FileReader();
              reader.onload = (e) => {
                if (e.target?.result) {
                  console.log('Created preview using FileReader for:', file.name);
                  setMediaPreview(prev => [...prev, {
                    url: e.target?.result as string,
                    file
                  }]);
                }
              };
              reader.onerror = (error) => {
                console.error('FileReader failed for:', file.name, error);
                // Fallback to blob URL
                try {
                  const previewUrl = URL.createObjectURL(file);
                  console.log('Fallback to blob URL for:', file.name);
                  setMediaPreview(prev => [...prev, {
                    url: previewUrl,
                    file
                  }]);
                } catch (blobError) {
                  console.error('Blob URL also failed for:', file.name, blobError);
                }
              };
              reader.readAsDataURL(file);
            } catch {
              // Preview optional
            }
          } else {
            setMediaPreview(prev => [...prev, { url: '', file }]);
          }
      }

      setFormData(prev => ({ ...prev, media: [...prev.media, ...uploadedFiles] }));
      // Note: mediaPreview is now updated asynchronously via FileReader callbacks
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
    const preview = mediaPreview[index];
    if (preview?.url && preview.url.startsWith('blob:')) {
      URL.revokeObjectURL(preview.url);
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
      const mediaUrls: string[] = [];
      for (const file of formData.media) {
        const url = await storageService.uploadFile(file, `${formData.title}-${Date.now()}`);
        mediaUrls.push(url);
      }

      // Combine existing media URLs with new ones
      const allMediaUrls = [...existingMedia.map(m => m.url), ...mediaUrls];

      const highlightData = {
        title: formData.title,
        description: formData.description || null,
        date_achieved: formData.date,
        date_end: formData.ongoing ? null : formData.dateEnd || null,
        ongoing: formData.ongoing,
        custom_type_label: formData.type === 'custom' ? formData.customTypeLabel.trim() : null,
        media_urls: allMediaUrls,
        type: formData.type,
        category: null
      };

      await highlightService.updateHighlight(highlightId, highlightData);

      // Send endorsement request if fields are filled
      const hasEndorsement =
        endorsementData.instructorName.trim() &&
        endorsementData.instructorEmail.trim() &&
        endorsementData.relationship.trim();
      let endorsementInvite: 'no_email' | 'error' | null = null;
      if (hasEndorsement) {
        const inviteResult = await submitEndorsementInviteRequest({
          achievementId: highlightId,
          portfolioId,
          instructorName: endorsementData.instructorName.trim(),
          instructorEmail: endorsementData.instructorEmail.trim(),
          relationship: endorsementData.relationship.trim(),
        });
        if (inviteResult === 'no_email') endorsementInvite = 'no_email';
        else if (inviteResult === 'error') endorsementInvite = 'error';
      }

      const q = new URLSearchParams({ highlightUpdated: 'true' });
      if (endorsementInvite) q.set('endorsementInvite', endorsementInvite);
      router.push(`/portfolio/${portfolioId}?${q.toString()}`);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // Will redirect
  }

  if (loadingHighlight) {
    return (
      <div className="min-h-screen bg-discovery-beige-200">
        <Header animateLogo={true} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" label="Loading..." />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-discovery-beige-200">
      <Header />

      {/* Action Bar */}
      <div className="bg-discovery-white-100 border-b border-discovery-beige-100 px-9 py-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBackClick}
            className="flex items-center text-discovery-grey hover:text-discovery-black transition-colors font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to portfolio
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-5">
        <div className="bg-discovery-white-100 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4">
            <h1 className="text-4xl lg:text-4xl font-medium text-discovery-black">Edit highlight</h1>
          </div>

          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <HighlightMetadataSection
                formData={formData}
                errors={errors}
                isTypeDropdownOpen={isTypeDropdownOpen}
                setIsTypeDropdownOpen={setIsTypeDropdownOpen}
                onChange={handleInputChange}
              />

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-md font-medium text-discovery-black mb-2">
                  Title *
                </label>
                <FormFieldError message={errors.title} />
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., First Piano Recital"
                  maxLength={100}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-discovery-primary focus:border-transparent transition-colors text-discovery-black ${
                    errors.title ? 'border-red-500' : 'border-discovery-grey-300'
                  }`}
                />
                <p className="text-discovery-grey text-sm mt-1">{formData.title.length}/100 characters</p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-md font-medium text-discovery-black mb-2">
                  Description (Optional)
                </label>
                <FormFieldError message={errors.description} />
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Ex: they practiced for weeks to get this piano piece right—so proud!"
                  rows={4}
                  maxLength={500}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-discovery-primary focus:border-transparent transition-colors text-discovery-black resize-none ${
                    errors.description ? 'border-red-500' : 'border-discovery-grey-300'
                  }`}
                />
                <p className="text-discovery-grey text-sm mt-1">{formData.description.length}/500 characters</p>
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-md font-medium text-discovery-black mb-2">Add Media (Optional)</label>
                <FormFieldError message={errors.media} />

                <div className="relative">
                  <input
                    type="file"
                    id="media"
                    multiple
                    accept="image/jpeg,image/png,application/pdf,audio/mpeg,audio/wav"
                    onChange={handleMediaUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingMedia}
                  />
                  <label
                    htmlFor="media"
                    className={`inline-flex items-center px-4 py-2 border border-discovery-grey-300 rounded-lg cursor-pointer transition-colors ${
                      uploadingMedia ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Choose files
                  </label>
                </div>

                <p className="text-discovery-grey text-xs mt-1">
                  Accepts JPEG, PNG, PDF, and audio files up to 50MB each.
                </p>

                {uploadingMedia && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <LoadingSpinner size="sm" />
                      <p className="text-sm font-medium text-blue-800">Processing files...</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Media Preview */}
              {(formData.media.length > 0 || existingMedia.length > 0) && (
                <div>
                  <h3 className="text-md font-medium text-discovery-black mb-2">Media Preview</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {existingMedia.map((media, index) => {
                      const fileType = getFileTypeFromUrl(media.url);
                      const filename = getFileNameFromUrl(media.url);
                      const displayFileType = fileType;

                      return (
                        <div key={media.id} className="relative">
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {displayFileType === 'pdf' ? (
                              <div className="flex flex-col items-center justify-center text-center p-2">
                                <FileText className="w-8 h-8 text-red-500 mb-1" />
                                <span className="text-xs text-gray-500 truncate">{filename}</span>
                              </div>
                            ) : displayFileType === 'video' ? (
                              <div className="flex flex-col items-center justify-center text-center p-2">
                                <Video className="w-8 h-8 text-blue-500 mb-1" />
                                <span className="text-xs text-gray-500 truncate">{filename}</span>
                              </div>
                            ) : displayFileType === 'audio' ? (
                              <div className="flex flex-col items-center justify-center text-center p-2">
                                <Music className="w-8 h-8 text-green-500 mb-1" />
                                <span className="text-xs text-gray-500 truncate">{filename}</span>
                              </div>
                            ) : displayFileType === 'image' ? (
                              <img
                                src={media.url}
                                alt={filename}
                                className="w-full h-full object-cover"
                                onError={(e) => {
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

                    {formData.media.map((file, index) => {
                      const preview = mediaPreview[index];
                      return (
                        <div key={index} className="relative">
                          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {file.type.startsWith('image/') && preview ? (
                              <img
                                src={preview.url}
                                alt={file.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error('Image preview failed to load:', {
                                    fileName: file.name,
                                    fileType: file.type,
                                    fileSize: file.size,
                                    previewUrl: preview.url,
                                    error: e,
                                  });
                                }}
                                onLoad={() => {
                                  console.log('Image preview loaded successfully:', file.name);
                                }}
                              />
                            ) : file.type === 'application/pdf' ? (
                              <div className="flex flex-col items-center justify-center text-center p-2">
                                <FileText className="w-8 h-8 text-red-500 mb-1" />
                                <span className="text-xs text-gray-500 truncate">{file.name}</span>
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

              {/* Request instructor endorsement (optional) */}
              <div className="border-t border-discovery-beige-100 pt-8">
                <label className="block text-md font-medium text-discovery-black mb-2">
                  Request instructor endorsement (optional)
                </label>
                <p className="text-discovery-grey text-sm mb-4">
                Invite an instructor or teacher to leave a comment about this achievement. You can request up to 3 endorsements at any time for this highlight.
                </p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="instructorName" className="block text-sm font-medium text-discovery-black mb-1">
                      Instructor name
                    </label>
                    <input
                      type="text"
                      id="instructorName"
                      value={endorsementData.instructorName}
                      onChange={(e) => setEndorsementData((p) => ({ ...p, instructorName: e.target.value }))}
                      placeholder="e.g. Coach Mike Reynolds"
                      className="w-full px-4 py-3 border border-discovery-grey-300 rounded-lg focus:ring-2 focus:ring-discovery-primary focus:border-transparent text-discovery-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="instructorEmail" className="block text-sm font-medium text-discovery-black mb-1">
                      Instructor email
                    </label>
                    <input
                      type="email"
                      id="instructorEmail"
                      value={endorsementData.instructorEmail}
                      onChange={(e) => setEndorsementData((p) => ({ ...p, instructorEmail: e.target.value }))}
                      placeholder="e.g. coach@example.com"
                      className="w-full px-4 py-3 border border-discovery-grey-300 rounded-lg focus:ring-2 focus:ring-discovery-primary focus:border-transparent text-discovery-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="relationship" className="block text-sm font-medium text-discovery-black mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      id="relationship"
                      value={endorsementData.relationship}
                      onChange={(e) => setEndorsementData((p) => ({ ...p, relationship: e.target.value }))}
                      placeholder="e.g. BJJ Instructor, Piano Teacher"
                      className="w-full px-4 py-3 border border-discovery-grey-300 rounded-lg focus:ring-2 focus:ring-discovery-primary focus:border-transparent text-discovery-black"
                    />
                  </div>
                </div>
              </div>

              {/* Delete + Cancel + Update — mobile: stacked Update, Cancel, Delete; md+: Delete left, Cancel+Update right */}
              <div className="flex flex-col gap-3 px-10 py-6 border-t border-discovery-beige-100 md:flex-row md:flex-wrap md:justify-between md:items-center">
                <div className="flex w-full flex-col gap-3 md:order-2 md:w-auto md:flex-row md:gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingMedia}
                    className="w-full px-8 py-4 rounded-pill text-lg font-semibold transition-colors shadow-lg hover:shadow-xl text-center disabled:opacity-50 disabled:cursor-not-allowed bg-discovery-orange hover:bg-discovery-orange-light text-white md:w-auto"
                  >
                    {isSubmitting ? 'Saving...' : 'Update highlight'}
                  </button>
                  <button
                    type="button"
                    onClick={handleBackClick}
                    className="w-full px-8 py-4 border border-discovery-beige-300 text-discovery-black rounded-pill hover:bg-discovery-beige-100 transition-colors font-medium md:w-auto"
                  >
                    Cancel
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full px-2 py-3 text-center text-sm font-semibold text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors md:order-1 md:w-auto md:self-center md:px-2 md:py-2 md:text-left"
                >
                  Delete Highlight
                </button>
              </div>

              <FormFieldError message={errors.submit} placement="form-submit" />
            </form>
          </div>
        </div>
      </main>

      <ConfirmDialog
        isOpen={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmNavigation}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        confirmLabel="Discard changes"
      />

      <ConfirmDialog
        isOpen={showDeleteModal}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete highlight?"
        message="Are you sure you want to delete this highlight? This action cannot be undone."
        confirmLabel="Delete highlight"
      />
    </div>
  );
}
