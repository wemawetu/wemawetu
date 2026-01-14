-- Fix the remaining overly permissive policy for contact_submissions

-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

-- Create a rate-limited insert policy (basic protection)
CREATE POLICY "Anyone can submit contact form with valid data"
ON public.contact_submissions FOR INSERT
WITH CHECK (
    -- Basic validation: require non-empty fields
    name IS NOT NULL AND name != '' AND
    email IS NOT NULL AND email != '' AND
    message IS NOT NULL AND message != ''
);