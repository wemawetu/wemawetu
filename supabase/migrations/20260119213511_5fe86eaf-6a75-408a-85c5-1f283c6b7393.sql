-- Create email configuration table for SMTP settings
CREATE TABLE public.email_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN DEFAULT false,
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_user TEXT,
  smtp_password TEXT,
  from_email TEXT,
  from_name TEXT DEFAULT 'Wemawetu Foundation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_config ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage email config
CREATE POLICY "Admins can view email config"
  ON public.email_config FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update email config"
  ON public.email_config FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert email config"
  ON public.email_config FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Insert default config row
INSERT INTO public.email_config (enabled, smtp_host, smtp_port, from_name)
VALUES (false, '', 587, 'Wemawetu Foundation');

-- Create trigger for updated_at
CREATE TRIGGER update_email_config_updated_at
  BEFORE UPDATE ON public.email_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();