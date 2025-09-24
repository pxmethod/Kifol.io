import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

class VideoCompressionService {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;

  async initialize() {
    if (this.isLoaded) return;

    this.ffmpeg = new FFmpeg();
    
    // Load FFmpeg with optimized settings
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    this.isLoaded = true;
  }

  async compressVideo(file: File, options: {
    maxSizeMB?: number;
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    onProgress?: (progress: number) => void;
  } = {}): Promise<Blob> {
    const {
      maxSizeMB = 25,
      quality = 28,
      maxWidth = 1280,
      maxHeight = 720,
      onProgress
    } = options;

    if (!this.ffmpeg) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('Failed to initialize FFmpeg');
    }

    // Set up progress callback
    if (onProgress) {
      this.ffmpeg.on('progress', ({ progress }) => {
        onProgress(progress * 100);
      });
    }

    const inputFileName = 'input.mp4';
    const outputFileName = 'output.mp4';

    try {
      // Write input file
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(file));

      // Get video dimensions
      const videoInfo = await this.getVideoInfo(file);
      const { width, height } = videoInfo;

      // Calculate scaling if needed
      let scaleFilter = '';
      if (width > maxWidth || height > maxHeight) {
        const scaleRatio = Math.min(maxWidth / width, maxHeight / height);
        const newWidth = Math.floor(width * scaleRatio);
        const newHeight = Math.floor(height * scaleRatio);
        scaleFilter = `scale=${newWidth}:${newHeight}`;
      }

      // Build FFmpeg command
      const command = [
        '-i', inputFileName,
        '-c:v', 'libx264',
        '-crf', quality.toString(),
        '-preset', 'fast',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-maxrate', '2M',
        '-bufsize', '4M'
      ];

      // Add scaling if needed
      if (scaleFilter) {
        command.push('-vf', scaleFilter);
      }

      command.push(outputFileName);

      // Run compression
      await this.ffmpeg.exec(command);

      // Read output file
      const data = await this.ffmpeg.readFile(outputFileName);
      
      // Clean up
      await this.ffmpeg.deleteFile(inputFileName);
      await this.ffmpeg.deleteFile(outputFileName);

      const blob = new Blob([data], { type: 'video/mp4' });
      
      // Check if compressed file is still too large
      if (blob.size > maxSizeMB * 1024 * 1024) {
        // Try with higher compression
        return this.compressVideo(file, {
          ...options,
          quality: Math.min(quality + 5, 35)
        });
      }

      return blob;
    } catch (error) {
      console.error('Video compression failed:', error);
      throw new Error('Failed to compress video');
    }
  }

  private async getVideoInfo(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight
        });
        URL.revokeObjectURL(video.src);
      };
      
      video.onerror = () => {
        reject(new Error('Failed to load video metadata'));
        URL.revokeObjectURL(video.src);
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  async getVideoThumbnail(file: File, timeInSeconds: number = 1): Promise<Blob> {
    if (!this.ffmpeg) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('Failed to initialize FFmpeg');
    }

    const inputFileName = 'input.mp4';
    const outputFileName = 'thumbnail.jpg';

    try {
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(file));
      
      await this.ffmpeg.exec([
        '-i', inputFileName,
        '-ss', timeInSeconds.toString(),
        '-vframes', '1',
        '-q:v', '2',
        outputFileName
      ]);

      const data = await this.ffmpeg.readFile(outputFileName);
      
      // Clean up
      await this.ffmpeg.deleteFile(inputFileName);
      await this.ffmpeg.deleteFile(outputFileName);

      return new Blob([data], { type: 'image/jpeg' });
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      throw new Error('Failed to generate thumbnail');
    }
  }
}

// Export singleton instance
export const videoCompressionService = new VideoCompressionService();
