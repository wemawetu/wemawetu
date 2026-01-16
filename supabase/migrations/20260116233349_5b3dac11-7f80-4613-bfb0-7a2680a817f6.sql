-- Create storage bucket for campaign images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign-images', 'campaign-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for campaign images
CREATE POLICY "Anyone can view campaign images"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaign-images');

CREATE POLICY "Authenticated users can upload campaign images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'campaign-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own campaign images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'campaign-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own campaign images"
ON storage.objects FOR DELETE
USING (bucket_id = 'campaign-images' AND auth.uid() IS NOT NULL);

-- Add receipt_url column to campaign_donations for storing donation receipts
ALTER TABLE public.campaign_donations 
ADD COLUMN IF NOT EXISTS receipt_url TEXT;