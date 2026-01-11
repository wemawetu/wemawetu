-- Payment Configuration Table for PayPal, M-Pesa, Donorbox
CREATE TABLE public.payment_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL, -- 'paypal', 'mpesa_till', 'mpesa_paybill', 'donorbox'
  enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'CreditCard',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider)
);

-- Enable Row Level Security
ALTER TABLE public.payment_config ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_config
CREATE POLICY "Anyone can view enabled payment configs" 
ON public.payment_config 
FOR SELECT 
USING (enabled = true);

CREATE POLICY "Admins can view all payment configs" 
ON public.payment_config 
FOR SELECT 
USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can create payment configs" 
ON public.payment_config 
FOR INSERT 
WITH CHECK (EXISTS ( SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can update payment configs" 
ON public.payment_config 
FOR UPDATE 
USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can delete payment configs" 
ON public.payment_config 
FOR DELETE 
USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));

-- Trigger for updated_at
CREATE TRIGGER update_payment_config_updated_at
BEFORE UPDATE ON public.payment_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Merchandise Table
CREATE TABLE public.merchandise (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  impact_message TEXT, -- "This purchase provides clean water for 2 families"
  category TEXT DEFAULT 'general',
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.merchandise ENABLE ROW LEVEL SECURITY;

-- Create policies for merchandise
CREATE POLICY "Anyone can view active merchandise" 
ON public.merchandise 
FOR SELECT 
USING (active = true);

CREATE POLICY "Admins can view all merchandise" 
ON public.merchandise 
FOR SELECT 
USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can create merchandise" 
ON public.merchandise 
FOR INSERT 
WITH CHECK (EXISTS ( SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can update merchandise" 
ON public.merchandise 
FOR UPDATE 
USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can delete merchandise" 
ON public.merchandise 
FOR DELETE 
USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true));

-- Trigger for updated_at
CREATE TRIGGER update_merchandise_updated_at
BEFORE UPDATE ON public.merchandise
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default payment configurations
INSERT INTO public.payment_config (provider, display_name, description, icon, enabled, config, sort_order) VALUES
('paypal', 'PayPal', 'Pay securely with PayPal or Credit/Debit Card', 'CreditCard', false, '{"email": "", "client_id": "", "sandbox": true}'::jsonb, 1),
('mpesa_till', 'M-Pesa Till', 'Pay via M-Pesa Buy Goods (Till Number)', 'Smartphone', false, '{"till_number": "", "store_number": "", "consumer_key": "", "consumer_secret": "", "passkey": "", "sandbox": true}'::jsonb, 2),
('mpesa_paybill', 'M-Pesa Paybill', 'Pay via M-Pesa Paybill with Account Number', 'Smartphone', false, '{"paybill_number": "", "account_reference": "DONATION", "consumer_key": "", "consumer_secret": "", "passkey": "", "sandbox": true}'::jsonb, 3),
('donorbox', 'Donorbox', 'Donate via Donorbox secure platform', 'Heart', false, '{"campaign_id": "", "embed_url": ""}'::jsonb, 4);

-- Insert sample merchandise with impact messages
INSERT INTO public.merchandise (name, description, price, impact_message, category, stock, sort_order) VALUES
('Wemawetu T-Shirt', 'Organic cotton t-shirt with our logo. Show your support!', 25.00, 'This purchase provides school supplies for 1 child', 'apparel', 100, 1),
('Reusable Water Bottle', 'Stainless steel bottle with Wemawetu branding', 18.00, 'This purchase funds 1 week of clean water for a family', 'accessories', 50, 2),
('Tote Bag', 'Eco-friendly canvas tote bag', 15.00, 'This purchase plants 10 trees', 'accessories', 75, 3),
('Bracelet Set', 'Handmade by artisans in our community programs', 12.00, 'Directly supports local artisans in our programs', 'jewelry', 200, 4),
('Coffee Mug', 'Ceramic mug with inspirational quote', 14.00, 'This purchase provides 1 month of school meals', 'accessories', 80, 5);