'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import ConfirmNavigationModal from '@/components/ConfirmNavigationModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { storageService } from '@/lib/storage';
import { HighlightService } from '@/lib/database/achievements';
import { HIGHLIGHT_TYPES, HighlightType, HighlightFormData } from '@/types/achievement';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { Video, FileText, Music, Image } from 'lucide-react';

export default function HighlightForm() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const portfolioId = params.id as string;
  const highlightId = params.highlightId as string; // For editing existing highlights
  const { uploadVideo, generateThumbnail, ...videoUploadState } = useVideoUpload();
  
  const [formData, setFormData] = useState<HighlightFormData>({
    title: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    description: '',
    type: '' as HighlightType,
    media: []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingMedia, setExistingMedia] = useState<Array<{id: string, url: string, fileName: string}>>([]);
  const [mediaPreview, setMediaPreview] = useState<{ url: string; file: File }[]>([]);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

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
      const highlight = await highlightService.getHighlight(highlightId);
      if (highlight) {
        setFormData({
          title: highlight.title,
          date: highlight.date_achieved.split('T')[0],
          description: highlight.description || '',
          type: highlight.type as HighlightType,
          media: []
        });
        // Debug the highlight data
        console.log('Highlight data:', highlight);
        console.log('Media URLs:', highlight.media_urls);
        
        setExistingMedia(highlight.media_urls.map((url, index) => ({
          id: `existing-${index}`,
          url,
          fileName: getFileNameFromUrl(url)
        })));
        setIsEditMode(true);
      }
    } catch (error) {
      console.error('Error loading highlight:', error);
      setErrors({ submit: 'Failed to load highlight data' });
    }
  };

  // Date validation function
  const validateDate = (dateString: string): { isValid: boolean; error?: string } => {
    // Check if the date string is in the correct format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return {
        isValid: false,
        error: 'Please enter a valid date in MM/DD/YYYY format'
      };
    }

    // Parse the date components manually to avoid timezone issues
    const [yearStr, monthStr, dayStr] = dateString.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    // Validate the date components
    if (month < 1 || month > 12) {
      return {
        isValid: false,
        error: 'Please enter a valid month (1-12)'
      };
    }

    if (day < 1 || day > 31) {
      return {
        isValid: false,
        error: 'Please enter a valid day (1-31)'
      };
    }

    // Create a date object using local timezone to avoid UTC issues
    const date = new Date(year, month - 1, day);
    
    // Check if the date is valid (handles invalid dates like Feb 30)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return {
        isValid: false,
        error: 'Please enter a valid date (e.g., 02/30/2024 is not a valid date)'
      };
    }

    // Check year range (reasonable limits for child achievements)
    const currentYear = new Date().getFullYear();
    const minYear = 1900; // Reasonable minimum
    const maxYear = currentYear + 10; // Allow future dates up to 10 years

    if (year < minYear || year > maxYear) {
      return {
        isValid: false,
        error: `Please enter a date between ${minYear} and ${maxYear}`
      };
    }

    // Check if date is too far in the future (more than 10 years)
    const futureLimit = new Date();
    futureLimit.setFullYear(currentYear + 10);
    if (date > futureLimit) {
      return {
        isValid: false,
        error: 'Date cannot be more than 10 years in the future'
      };
    }

    return { isValid: true };
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
    } else {
      // Validate date format and range
      const dateValidation = validateDate(formData.date);
      if (!dateValidation.isValid && dateValidation.error) {
        newErrors.date = dateValidation.error;
      }
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
    
    // Real-time date validation
    if (field === 'date' && typeof value === 'string' && value.trim()) {
      const dateValidation = validateDate(value);
      if (!dateValidation.isValid && dateValidation.error) {
        setErrors(prev => ({ ...prev, date: dateValidation.error! }));
      }
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
        // Validate file
        const validation = storageService.validateFile(file);
        if (!validation.valid) {
          setErrors(prev => ({ ...prev, media: validation.error || 'Invalid file' }));
          return;
        }
        
        // Handle video files with compression
        if (file.type.startsWith('video/')) {
          try {
            // Upload video with compression
            const videoUrl = await uploadVideo(file, {
              maxSizeMB: 25,
              quality: 28,
              maxWidth: 1280,
              maxHeight: 720
            });
            
            // Generate thumbnail for video
            let thumbnailUrl = '';
            try {
              thumbnailUrl = await generateThumbnail(file);
            } catch (thumbError) {
              console.warn('Thumbnail generation failed:', thumbError);
            }
            
            // Create a mock file object for the form data
            const processedFile = new File([file], file.name, {
              type: file.type,
              lastModified: file.lastModified
            });
            
            // Store the uploaded URL in a custom property
            (processedFile as any).uploadedUrl = videoUrl;
            (processedFile as any).thumbnailUrl = thumbnailUrl;
            
            uploadedFiles.push(processedFile);
            
            // Create preview URL for video
            newPreviews.push({
              url: URL.createObjectURL(file),
              file: processedFile
            });
          } catch (videoError) {
            console.error('Video processing failed:', videoError);
            setErrors(prev => ({ 
              ...prev, 
              media: 'Failed to process video. Please try again.' 
            }));
            return;
          }
        } else {
          // Handle non-video files normally
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

      if (isEditMode && highlightId) {
        await highlightService.updateHighlight(highlightId, highlightData);
        // Redirect back to portfolio with update confirmation
        router.push(`/portfolio/${portfolioId}?highlightUpdated=true`);
      } else {
        await highlightService.createHighlight(highlightData);
        // Redirect back to portfolio with add confirmation
        router.push(`/portfolio/${portfolioId}?highlightAdded=true`);
      }
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
              {/* Type Selection */}
              <div>
                <label htmlFor="type" className="block text-md font-medium text-discovery-black mb-2">
                  Type *
                </label>
                <div className="type-dropdown relative">
                  <button
                    type="button"
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className={`w-full px-4 py-3 text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-discovery-primary focus:border-transparent transition-colors cursor-pointer text-discovery-black ${
                      errors.type ? 'border border-red-500' : ''
                    } ${isTypeDropdownOpen ? 'ring-2 ring-discovery-primary border-transparent' : ''}`}
                    style={!errors.type && !isTypeDropdownOpen ? {
                      border: '1px solid #DDDDE1',
                      backgroundColor: '#ffffff'
                    } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {formData.type && getTypeIcon(formData.type as HighlightType)}
                        <span className={`ml-2 ${formData.type ? 'text-discovery-black' : 'text-discovery-grey'}`}>
                          {getSelectedType()?.name || 'Select a type...'}
                        </span>
                      </div>
                      <svg 
                        className={`w-5 h-5 text-discovery-grey transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {isTypeDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-discovery-white-100 border border-discovery-grey-300 rounded-lg shadow-lg">
                      {HIGHLIGHT_TYPES.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            handleInputChange('type', type.id);
                            setIsTypeDropdownOpen(false);
                          }}
                          className="w-full px-3 py-3 text-left hover:bg-discovery-beige-100 first:rounded-t-lg last:rounded-b-lg flex items-center transition-colors"
                        >
                          <div className="flex items-center">
                            {getTypeIcon(type.id)}
                            <div className="ml-3">
                              <div className="text-base font-medium text-discovery-black">{type.name}</div>
                              <div className="text-xs text-discovery-grey">{type.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-md font-medium text-discovery-black mb-2">
                  Title *
                </label>
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
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
                <p className="text-discovery-grey text-sm mt-1">
                  {formData.title.length}/100 characters
                </p>
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-md font-medium text-discovery-black mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-discovery-primary focus:border-transparent transition-colors text-discovery-black cursor-pointer ${
                    errors.date ? 'border-red-500' : 'border-discovery-grey-300'
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-md font-medium text-discovery-black mb-2">
                  Description (Optional)
                </label>
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
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
                <p className="text-discovery-grey text-sm mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-md font-medium text-discovery-black mb-2">
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
                  Photos, videos, PDFs, and audio files up to 50MB each.
                </p>
                
                {/* Video Upload Progress */}
                {(videoUploadState.isUploading || videoUploadState.isCompressing) && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <LoadingSpinner size="sm" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800">
                          {videoUploadState.status}
                        </p>
                        {videoUploadState.progress > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-blue-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${videoUploadState.progress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-blue-600 mt-1">
                              {Math.round(videoUploadState.progress)}% complete
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Video Upload Error */}
                {videoUploadState.error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{videoUploadState.error}</p>
                  </div>
                )}
                
                {errors.media && (
                  <p className="text-red-500 text-sm mt-1">{errors.media}</p>
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
                  const filename = getFileNameFromUrl(media.url);
                  
                  // Debug info (remove this after testing)
                  console.log(`Media ${index}:`, {
                    url: media.url,
                    filename: filename,
                    fileType: fileType,
                    originalFileName: media.fileName,
                    urlLength: media.url.length,
                    urlParts: media.url.split('/'),
                    lastPart: media.url.split('/').pop()
                  });
                  
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
                            <span className="text-xs text-red-500 mt-1">DEBUG: {fileType}</span>
                            <span className="text-xs text-blue-500 mt-1">URL: {media.url.substring(0, 30)}...</span>
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

              {/* Submit Button */}
              <div className="flex justify-end px-10 py-6 border-t border-discovery-beige-100">
                <button
                  type="button"
                  onClick={handleBackClick}
                  className="px-6 py-3 border border-discovery-beige-300 text-discovery-black rounded-lg hover:bg-discovery-beige-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingMedia}
                  className="px-8 py-4 rounded-pill text-lg font-semibold transition-colors shadow-lg hover:shadow-xl text-center disabled:opacity-50 disabled:cursor-not-allowed bg-discovery-orange hover:bg-discovery-orange-light text-white"
                >
                  {isSubmitting ? 'Saving...' : (isEditMode ? 'Update highlight' : 'Add highlight')}
                </button>
              </div>

              {errors.submit && (
                <p className="text-red-500 text-sm text-center mt-2">{errors.submit}</p>
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
