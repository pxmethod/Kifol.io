'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
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
import { MAX_OPEN_ENDORSEMENT_INVITES_PER_HIGHLIGHT } from '@/lib/database/endorsements';
import { alignMediaSizesToUrls, mediaFileSizeAtIndex } from '@/lib/highlightMediaSizes';
import { alignMediaDisplayNamesToUrls, mediaDisplayNameAtIndex } from '@/lib/highlightMediaDisplayNames';
import { validateHighlightMetadata } from '@/lib/highlightFormValidation';
import { Video, FileText, Music, Image } from 'lucide-react';

export default function HighlightForm() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const portfolioId = params.id as string;
  const highlightId = params.highlightId as string | undefined;
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
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingMedia, setExistingMedia] = useState<
    Array<{ id: string; url: string; fileName: string; sizeBytes: number }>
  >([]);
  const [mediaPreview, setMediaPreview] = useState<{ url: string; file: File }[]>([]);
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
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      let filename = pathname.split('/').pop() || 'Unknown file';
      
      // If the filename doesn't have an extension, try to extract from query params or other parts
      if (!filename.includes('.')) {
        // Check if there's a filename in query parameters
        const searchParams = urlObj.searchParams;
        const queryFilename = searchParams.get('filename') || searchParams.get('name');
        if (queryFilename) {
          filename = queryFilename;
        } else {
          // Generate a more descriptive name based on the URL structure
          const pathParts = pathname.split('/').filter(part => part.length > 0);
          if (pathParts.length > 1) {
            filename = `${pathParts[pathParts.length - 2]}_${pathParts[pathParts.length - 1]}`;
          }
        }
      }
      
      return filename;
    } catch {
      // If URL parsing fails, try to extract from the string
      const parts = url.split('/');
      let filename = parts[parts.length - 1] || 'Unknown file';
      
      // If still no extension, try to make it more descriptive
      if (!filename.includes('.')) {
        const pathParts = url.split('/').filter(part => part.length > 0);
        if (pathParts.length > 1) {
          filename = `${pathParts[pathParts.length - 2]}_${pathParts[pathParts.length - 1]}`;
        }
      }
      
      return filename;
    }
  };

  // Utility function to detect file type from URL
  const getFileTypeFromUrl = (url: string): string => {
    const filename = getFileNameFromUrl(url);
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    // Debug logging
    console.log('URL:', url);
    console.log('Filename:', filename);
    console.log('Extension:', extension);
    
    // Check URL path for video indicators (some URLs might not have extensions)
    const urlLower = url.toLowerCase();
    
    // FIRST: Check for explicit video indicators in URL
    if (urlLower.includes('mp4') || urlLower.includes('mov') || urlLower.includes('avi') || 
        urlLower.includes('mkv') || urlLower.includes('webm') || urlLower.includes('m4v') ||
        urlLower.includes('video') || urlLower.includes('highlight-media')) {
      console.log('Detected as VIDEO based on URL content');
      return 'video';
    }
    
    // SECOND: Check file extension
    if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'].includes(extension)) {
      console.log('Detected as VIDEO based on extension');
      return 'video';
    }
    
    // THIRD: Check for audio
    if (['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'].includes(extension)) {
      console.log('Detected as AUDIO based on extension');
      return 'audio';
    }
    
    // FOURTH: Check for PDF
    if (extension === 'pdf') {
      console.log('Detected as PDF based on extension');
      return 'pdf';
    }
    
    // FIFTH: Check for images (only if explicitly image extensions)
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      console.log('Detected as IMAGE based on extension');
      return 'image';
    }
    
    // SIXTH: For storage URLs without clear extensions, assume video if not explicitly image
    if (urlLower.includes('storage') && !urlLower.includes('image') && !urlLower.includes('photo')) {
      console.log('Detected as VIDEO based on storage URL pattern');
      return 'video';
    }
    
    // SEVENTH: Default to video for any unknown media files
    console.log('Defaulting to VIDEO for unknown file type');
    return 'video';
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?message=Please log in to add highlights');
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

  // Load existing highlight data if editing
  useEffect(() => {
    if (highlightId && user) {
      loadExistingHighlight();
    }
  }, [highlightId, user]);

  const loadExistingHighlight = async () => {
    try {
      const highlight = await highlightService.getHighlight(highlightId as string);
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
        // Debug the highlight data
        console.log('Highlight data:', highlight);
        console.log('Media URLs:', highlight.media_urls);
        
        setExistingMedia((highlight.media_urls || []).map((url, index) => ({
          id: `existing-${index}`,
          url,
          fileName: mediaDisplayNameAtIndex(highlight.media_display_names, index, url),
          sizeBytes: mediaFileSizeAtIndex(highlight.media_sizes, index),
        })));
        setIsEditMode(true);
      }
    } catch (error) {
      console.error('Error loading highlight:', error);
      setErrors({ submit: 'Failed to load highlight data' });
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
      const previewAccum: { url: string; file: File }[] = [];

      for (const file of files) {
        // Validate file
        const validation = storageService.validateFile(file);
        if (!validation.valid) {
          setErrors(prev => ({ ...prev, media: validation.error || 'Invalid file' }));
          return;
        }
        
        // Handle files - check for HEIC and convert if needed
          let fileToUpload = file;
          
          // Detect HEIC files (they might have .jpg extension but be HEIC format)
          const isLikelyHEIC = file.name.toLowerCase().endsWith('.heic') || 
                               file.name.toLowerCase().endsWith('.heif') ||
                               file.type === 'image/heic' ||
                               file.type === 'image/heif';
          
          // Also check the file signature for HEIC (starts with "ftyp" in the header)
          if (file.type.startsWith('image/') && !isLikelyHEIC) {
            // Read first few bytes to check for HEIC signature
            const checkHEIC = new Promise<boolean>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const arr = new Uint8Array(e.target?.result as ArrayBuffer);
                const header = String.fromCharCode(...arr.slice(4, 8));
                resolve(header === 'ftyp');
              };
              reader.onerror = () => resolve(false);
              reader.readAsArrayBuffer(file.slice(0, 12));
            });
            
            const isHEICBySignature = await checkHEIC;
            
            if (isHEICBySignature) {
              console.log('Detected HEIC file by signature:', file.name);
              try {
                setUploadingMedia(true);
                const heic2any = (await import('heic2any')).default;
                const convertedBlob = await heic2any({
                  blob: file,
                  toType: 'image/jpeg',
                  quality: 0.9
                }) as Blob;
                
                // Create a new File object from the converted blob
                const convertedFileName = file.name.replace(/\.(heic|heif|jpg|jpeg)$/i, '.jpg');
                fileToUpload = new File([convertedBlob], convertedFileName, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                console.log('Converted HEIC to JPEG:', convertedFileName);
              } catch (conversionError) {
                console.error('HEIC conversion failed:', conversionError);
                setErrors(prev => ({ 
                  ...prev, 
                  media: 'This image format is not supported. Please convert to JPG or PNG first.' 
                }));
                setUploadingMedia(false);
                return;
              }
            }
          } else if (isLikelyHEIC) {
            // Convert known HEIC files
            console.log('Converting HEIC file:', file.name);
            try {
              setUploadingMedia(true);
              const heic2any = (await import('heic2any')).default;
              const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9
              }) as Blob;
              
              const convertedFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
              fileToUpload = new File([convertedBlob], convertedFileName, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              console.log('Converted HEIC to JPEG:', convertedFileName);
            } catch (conversionError) {
              console.error('HEIC conversion failed:', conversionError);
              setErrors(prev => ({ 
                ...prev, 
                media: 'This image format is not supported. Please convert to JPG or PNG first.' 
              }));
              setUploadingMedia(false);
              return;
            }
          }
          
          uploadedFiles.push(fileToUpload);

          if (fileToUpload.type.startsWith('image/')) {
            try {
              const url = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve((e.target?.result as string) || '');
                reader.onerror = () => resolve('');
                reader.readAsDataURL(fileToUpload);
              });
              previewAccum.push({ url, file: fileToUpload });
            } catch {
              previewAccum.push({ url: '', file: fileToUpload });
            }
          } else {
            previewAccum.push({ url: '', file: fileToUpload });
          }
      }

      setMediaPreview((prev) => [...prev, ...previewAccum]);
      setFormData((prev) => ({ ...prev, media: [...prev.media, ...uploadedFiles] }));
    } catch (error) {
      console.error('Media upload error:', error);
      setErrors(prev => ({ 
        ...prev, 
        media: 'Failed to upload media. Please try again.' 
      }));
    } finally {
      event.target.value = '';
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
      // Process media files
      const mediaUrls: string[] = [];
      for (let i = 0; i < formData.media.length; i++) {
        const url = await storageService.uploadHighlightMedia(
          formData.media[i],
          i,
          formData.media
        );
        mediaUrls.push(url);
      }

      // Combine existing media URLs with new ones
      const allMediaUrls = [...existingMedia.map((m) => m.url), ...mediaUrls];
      const allMediaSizes = alignMediaSizesToUrls(allMediaUrls, [
        ...existingMedia.map((m) => m.sizeBytes),
        ...formData.media.map((f) => f.size),
      ]);
      const allMediaDisplayNames = alignMediaDisplayNamesToUrls(allMediaUrls, [
        ...existingMedia.map((m) => m.fileName),
        ...formData.media.map((f) => f.name),
      ]);

      const highlightData = {
        portfolio_id: portfolioId,
        title: formData.title,
        description: formData.description || null,
        date_achieved: formData.date,
        date_end: formData.ongoing ? null : formData.dateEnd || null,
        ongoing: formData.ongoing,
        custom_type_label: formData.type === 'custom' ? formData.customTypeLabel.trim() : null,
        media_urls: allMediaUrls,
        media_sizes: allMediaSizes,
        media_display_names: allMediaDisplayNames,
        type: formData.type,
        category: null,
      };

      let savedHighlightId: string;

      if (isEditMode && highlightId) {
        await highlightService.updateHighlight(highlightId, highlightData);
        savedHighlightId = highlightId;
      } else {
        const created = await highlightService.createHighlight(highlightData);
        savedHighlightId = created.id;
      }

      // Send endorsement request if fields are filled (before redirect)
      const hasEndorsement =
        endorsementData.instructorName.trim() &&
        endorsementData.instructorEmail.trim() &&
        endorsementData.relationship.trim();
      let endorsementInvite: 'no_email' | 'error' | null = null;
      if (hasEndorsement) {
        const inviteResult = await submitEndorsementInviteRequest({
          achievementId: savedHighlightId,
          portfolioId,
          instructorName: endorsementData.instructorName.trim(),
          instructorEmail: endorsementData.instructorEmail.trim(),
          relationship: endorsementData.relationship.trim(),
        });
        if (inviteResult === 'no_email') endorsementInvite = 'no_email';
        else if (inviteResult === 'error') endorsementInvite = 'error';
      }

      const q = new URLSearchParams();
      if (isEditMode) {
        q.set('highlightUpdated', 'true');
      } else {
        q.set('highlightAdded', 'true');
      }
      if (endorsementInvite) q.set('endorsementInvite', endorsementInvite);
      router.push(`/portfolio/${portfolioId}?${q.toString()}`);
    } catch (error) {
      console.error('Error saving highlight:', error);
      setErrors({ submit: 'Failed to save highlight. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // Will redirect
  }

  // Show loading while checking authentication
  if (loading) {
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
            <h1 className="text-4xl lg:text-4xl font-medium text-discovery-black">
              {isEditMode ? 'Edit highlight' : 'Add highlight'}
            </h1>
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
                <p className="text-discovery-grey text-sm mt-1">
                  {formData.title.length}/100 characters
                </p>
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
                <p className="text-discovery-grey text-sm mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-md font-medium text-discovery-black mb-2">
                  Add Media (Optional)
                </label>
                <FormFieldError message={errors.media} />

                {/* File Input */}
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
                
                <p className="text-discovery-grey text-xs mt-1">
                  Accepts JPEG, PNG, PDF, and audio files up to 50MB each. 
                </p>
                
                {/* Media Processing Status */}
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
                {/* Existing Media */}
                {existingMedia.map((media, index) => {
                  const fileType = getFileTypeFromUrl(media.url);
                  const filename = media.fileName;
                  
                  // Use the detected file type
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
                  const preview = mediaPreview[index];
                  return (
                    <div
                      key={`new-media-${file.name}-${file.size}-${file.lastModified}-${index}`}
                      className="relative"
                    >
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
                                error: e
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
                  Invite an instructor or teacher to leave a comment about this achievement. You can have up to{' '}
                  {MAX_OPEN_ENDORSEMENT_INVITES_PER_HIGHLIGHT} open invitation links at a time (completed endorsements do
                  not count toward this limit).
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

              {/* Submit Button — mobile: stacked primary then Cancel; md+: row, Cancel then primary */}
              <div className="flex flex-col gap-3 px-10 py-6 border-t border-discovery-beige-100 md:flex-row md:flex-wrap md:justify-end md:items-center">
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingMedia}
                  className="w-full px-8 py-4 rounded-pill text-lg font-semibold transition-colors shadow-lg hover:shadow-xl text-center disabled:opacity-50 disabled:cursor-not-allowed bg-discovery-orange hover:bg-discovery-orange-light text-white md:order-2 md:w-auto"
                >
                  {isSubmitting ? 'Saving...' : (isEditMode ? 'Update highlight' : 'Add highlight')}
                </button>
                <button
                  type="button"
                  onClick={handleBackClick}
                  className="w-full px-8 py-4 border border-discovery-beige-300 text-discovery-black rounded-pill hover:bg-discovery-beige-100 transition-colors font-medium md:order-1 md:w-auto"
                >
                  Cancel
                </button>
              </div>

              <FormFieldError message={errors.submit} placement="form-submit" />
            </form>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmNavigation}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        confirmLabel="Discard changes"
      />
    </div>
  );
}
