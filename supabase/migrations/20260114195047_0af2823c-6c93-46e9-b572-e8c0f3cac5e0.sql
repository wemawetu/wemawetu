-- Fix overly permissive policies for campaign_donations

-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "Anyone can create donations" ON public.campaign_donations;

-- Create a more restrictive insert policy that only allows donations to approved campaigns
CREATE POLICY "Anyone can donate to approved campaigns"
ON public.campaign_donations FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.campaigns 
        WHERE campaigns.id = campaign_donations.campaign_id 
        AND campaigns.status = 'approved'
    )
);