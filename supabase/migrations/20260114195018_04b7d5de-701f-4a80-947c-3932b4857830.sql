-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create campaigns table
CREATE TABLE public.campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    story TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    target_amount NUMERIC NOT NULL CHECK (target_amount > 0),
    raised_amount NUMERIC NOT NULL DEFAULT 0,
    image_url TEXT,
    mpesa_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    rejection_reason TEXT,
    is_featured BOOLEAN DEFAULT false,
    donor_count INTEGER DEFAULT 0,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Campaigns RLS policies
CREATE POLICY "Anyone can view approved campaigns"
ON public.campaigns FOR SELECT
USING (status = 'approved');

CREATE POLICY "Users can view their own campaigns"
ON public.campaigns FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all campaigns"
ON public.campaigns FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create campaigns"
ON public.campaigns FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending campaigns"
ON public.campaigns FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can update any campaign"
ON public.campaigns FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own pending campaigns"
ON public.campaigns FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can delete any campaign"
ON public.campaigns FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create campaign_donations table
CREATE TABLE public.campaign_donations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    donor_name TEXT NOT NULL DEFAULT 'Anonymous',
    donor_email TEXT,
    donor_phone TEXT,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    platform_fee NUMERIC NOT NULL DEFAULT 0,
    net_amount NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'mpesa',
    payment_reference TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    message TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_donations ENABLE ROW LEVEL SECURITY;

-- Donations RLS policies
CREATE POLICY "Anyone can view completed donations"
ON public.campaign_donations FOR SELECT
USING (payment_status = 'completed');

CREATE POLICY "Campaign owners can view their donations"
ON public.campaign_donations FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_donations.campaign_id 
    AND campaigns.user_id = auth.uid()
));

CREATE POLICY "Admins can view all donations"
ON public.campaign_donations FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create donations"
ON public.campaign_donations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update donations"
ON public.campaign_donations FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create withdrawal_requests table
CREATE TABLE public.withdrawal_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    mpesa_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    rejection_reason TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    transaction_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Withdrawal RLS policies
CREATE POLICY "Users can view their own withdrawals"
ON public.withdrawal_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawals"
ON public.withdrawal_requests FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create withdrawal requests"
ON public.withdrawal_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update withdrawals"
ON public.withdrawal_requests FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update campaign stats after donation
CREATE OR REPLACE FUNCTION public.update_campaign_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.payment_status = 'completed' AND (OLD IS NULL OR OLD.payment_status != 'completed') THEN
        UPDATE public.campaigns
        SET 
            raised_amount = raised_amount + NEW.net_amount,
            donor_count = donor_count + 1,
            updated_at = now()
        WHERE id = NEW.campaign_id;
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger for donation stats
CREATE TRIGGER on_donation_completed
    AFTER INSERT OR UPDATE ON public.campaign_donations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_campaign_stats();

-- Create updated_at trigger for campaigns
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Assign existing admins the admin role (based on profiles.is_admin)
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM public.profiles
WHERE is_admin = true
ON CONFLICT (user_id, role) DO NOTHING;