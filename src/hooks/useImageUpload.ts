import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseImageUploadOptions {
  bucket: string;
  folder?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export const useImageUpload = (options: UseImageUploadOptions) => {
  const { bucket, folder = '', maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] } = options;
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<string | null> => {
    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please upload an image file (${allowedTypes.map(t => t.split('/')[1]).join(', ')})`,
        variant: "destructive"
      });
      return null;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast({
        title: "File too large",
        description: `Please upload an image smaller than ${maxSizeMB}MB`,
        variant: "destructive"
      });
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setProgress(100);
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully"
      });

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (url: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const urlParts = url.split(`${bucket}/`);
      if (urlParts.length < 2) return false;
      
      const filePath = urlParts[1];
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Delete image error:', error);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
    progress
  };
};