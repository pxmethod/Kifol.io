import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export class StorageService {
  private readonly BUCKET_NAME = 'portfolio-photos'

  /**
   * Upload a file to Supabase storage and return the public URL
   */
  async uploadFile(file: File, fileName: string): Promise<string> {
    try {
      // Check if bucket exists, create if not
      await this.ensureBucket()

      // Generate unique filename
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const uniqueFileName = `${timestamp}-${fileName.replace(/[^a-z0-9]/gi, '_')}.${extension}`

      // Upload file to storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw new Error(`Failed to upload file: ${error.message}`)
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
   * Ensure the storage bucket exists
   */
  private async ensureBucket(): Promise<void> {
    try {
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some((bucket: any) => bucket.name === this.BUCKET_NAME)

      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
          fileSizeLimit: 2097152 // 2MB
        })

        if (error) {
          console.error('Bucket creation error:', error)
          throw new Error(`Failed to create storage bucket: ${error.message}`)
        }
      }
    } catch (error) {
      console.error('Bucket check/creation error:', error)
      throw error
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      return { valid: false, error: 'File size must be 2MB or less' }
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a JPEG, PNG, GIF, or SVG file' }
    }

    return { valid: true }
  }
}

export const storageService = new StorageService()