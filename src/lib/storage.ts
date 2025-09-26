import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export class StorageService {
  private BUCKET_NAME = 'portfolio-photos'

  /**
   * Upload a file to storage
   */
  async uploadFile(file: File, fileName: string): Promise<string> {
    try {
      // Generate unique filename with valid characters only
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop() || 'jpg'
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9]/g, '_')
      const uniqueFileName = `${timestamp}_${cleanFileName}.${fileExtension}`

      // Upload file to storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        
        // Provide more specific error messages
        if (error.message.includes('exceeded the maximum allowed size')) {
          throw new Error('File is too large. Please use files under 50MB.')
        } else if (error.message.includes('Invalid file type')) {
          throw new Error('File type not supported. Please use JPEG, PNG, GIF, PDF, MP4, MOV, MP3, or WAV files.')
        } else {
          throw new Error(`Failed to upload file: ${error.message}`)
        }
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path)

      return publicUrlData.publicUrl
    } catch (error) {
      console.error('Storage upload error:', error)
      throw error
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(url: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = url.split('/')
      const fileName = urlParts[urlParts.length - 1]

      if (!fileName || fileName.includes('placeholders')) {
        // Don't delete placeholder images
        return
      }

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileName])

      if (error) {
        console.error('Delete error:', error)
        // Don't throw error for delete failures as it's not critical
      }
    } catch (error) {
      console.error('Storage delete error:', error)
      // Don't throw error for delete failures
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size (50MB limit - Supabase default limit)
    const maxSizeMB = 50;
    if (file.size > maxSizeMB * 1024 * 1024) {
      return { valid: false, error: `File size must be ${maxSizeMB}MB or less` }
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'application/pdf',
      'video/mp4',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav'
    ]
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload JPEG, PNG, GIF, PDF, MP4, MOV, MP3, or WAV files only' }
    }

    return { valid: true }
  }
}

export const storageService = new StorageService()