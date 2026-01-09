
-- Create impact_stats table for the statistics section
CREATE TABLE public.impact_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon TEXT NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'text-primary',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create programs table for the programs section
CREATE TABLE public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  icon TEXT NOT NULL DEFAULT 'Droplets',
  link TEXT DEFAULT '/programs',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crypto_config table for Solana coin info
CREATE TABLE public.crypto_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coin_name TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT 'Solana',
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  how_to_buy TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.impact_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_config ENABLE ROW LEVEL SECURITY;

-- RLS policies for impact_stats
CREATE POLICY "Anyone can view active impact stats" ON public.impact_stats FOR SELECT USING (active = true);
CREATE POLICY "Admins can view all impact stats" ON public.impact_stats FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can create impact stats" ON public.impact_stats FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can update impact stats" ON public.impact_stats FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can delete impact stats" ON public.impact_stats FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));

-- RLS policies for programs
CREATE POLICY "Anyone can view active programs" ON public.programs FOR SELECT USING (active = true);
CREATE POLICY "Admins can view all programs" ON public.programs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can create programs" ON public.programs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can update programs" ON public.programs FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can delete programs" ON public.programs FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));

-- RLS policies for crypto_config
CREATE POLICY "Anyone can view active crypto config" ON public.crypto_config FOR SELECT USING (active = true);
CREATE POLICY "Admins can view all crypto config" ON public.crypto_config FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can create crypto config" ON public.crypto_config FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can update crypto config" ON public.crypto_config FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can delete crypto config" ON public.crypto_config FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));

-- Add triggers for updated_at
CREATE TRIGGER update_impact_stats_updated_at BEFORE UPDATE ON public.impact_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_crypto_config_updated_at BEFORE UPDATE ON public.crypto_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default impact stats
INSERT INTO public.impact_stats (icon, value, label, color, sort_order) VALUES
('Users', '50,000+', 'Lives Impacted', 'text-primary', 1),
('Droplets', '120+', 'Water Projects', 'text-secondary', 2),
('Home', '500+', 'Homes Built', 'text-accent', 3),
('TreePine', '25,000+', 'Trees Planted', 'text-primary', 4),
('GraduationCap', '3,000+', 'Students Supported', 'text-secondary', 5),
('Heart', '15+', 'Communities Served', 'text-accent', 6);

-- Insert default programs
INSERT INTO public.programs (title, description, icon, sort_order) VALUES
('Clean Water', 'Providing sustainable access to safe, clean drinking water through solar-powered boreholes and rainwater harvesting.', 'Droplets', 1),
('Safe Shelter', 'Building eco-friendly homes using stabilized soil blocks and local materials for vulnerable families.', 'Home', 2),
('Education Access', 'Supporting students with scholarships, digital learning hubs, and school infrastructure improvements.', 'GraduationCap', 3),
('Planet Protection', 'Restoring forests, promoting recycling, and training communities in climate-smart agriculture.', 'TreePine', 4);
