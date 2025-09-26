import { useState, useCallback } from 'react';
import { videoCompressionService } from '@/lib/video-compression';
import { storageService } from '@/lib/storage';

interface VideoUploadOptions {
  maxSizeMB?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface VideoUploadState {
  isUploading: boolean;
  isCompressing: boolean;
  progress: number;
  error: string | null;
  status: string;
}

export const useVideoUpload = () => {
  const [state, setState] = useState<VideoUploadState>({
    isUploading: false,
    isCompressing: false,
    progress: 0,
    error: null,
    status: ''
  });

  const uploadVideo = useCallback(async (
    file: File,
    options: VideoUploadOptions = {}
  ): Promise<string> => {

    // Reset state
    setState({
      isUploading: false,
      isCompressing: false,
      progress: 0,
      error: null,
      status: 'Analyzing video...'
    });

    try {
      // Check file size limits
      const maxAllowedSize = 50 * 1024 * 1024; // 50MB (Supabase default limit)
      if (file.size > maxAllowedSize) {
        throw new Error(`Video file is too large. Maximum size allowed is ${maxAllowedSize / (1024 * 1024)}MB.`);
      }

      const uploadFile: File | Blob = file;

      // Temporarily disable compression to fix corrupted video issue
      // TODO: Re-enable compression once FFmpeg issues are resolved
      setState(prev => ({
        ...prev,
        status: 'Uploading video directly (compression disabled)...'
      }));

      // Upload the file
      setState(prev => ({
        ...prev,
        isUploading: true,
        status: 'Uploading to server...'
      }));

      // Convert Blob to File if needed
      const fileToUpload = uploadFile instanceof File 
        ? uploadFile 
        : new File([uploadFile], file.name, { type: file.type });
      
      const url = await storageService.uploadFile(fileToUpload, 'highlight-media');

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        status: 'Upload complete!'
      }));

      return url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setState(prev => ({
        ...prev,
        isUploading: false,
        isCompressing: false,
        error: errorMessage,
        status: 'Upload failed'
      }));

      throw error;
    }
  }, []);

  const generateThumbnail = useCallback(async (file: File): Promise<string> => {
    try {
      setState(prev => ({
        ...prev,
        status: 'Generating thumbnail...'
      }));

      const thumbnailBlob = await videoCompressionService.getVideoThumbnail(file, 1);
      const thumbnailFile = new File([thumbnailBlob], `thumbnail_${file.name}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      const thumbnailUrl = await storageService.uploadFile(thumbnailFile, 'highlight-thumbnails');

      setState(prev => ({
        ...prev,
        status: 'Thumbnail generated!'
      }));

      return thumbnailUrl;
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      throw new Error('Failed to generate thumbnail');
    }
  }, []);

  const resetState = useCallback(() => {
    setState({
      isUploading: false,
      isCompressing: false,
      progress: 0,
      error: null,
      status: ''
    });
  }, []);

  return {
    ...state,
    uploadVideo,
    generateThumbnail,
    resetState
  };
};
