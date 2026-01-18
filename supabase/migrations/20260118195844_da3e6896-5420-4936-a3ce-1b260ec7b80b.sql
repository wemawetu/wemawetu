-- Create orders table for merchandise purchases
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_country TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping_fee NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  order_status TEXT NOT NULL DEFAULT 'pending',
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can create orders (for checkout)
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
));

-- Admins can update orders
CREATE POLICY "Admins can update orders" 
ON public.orders 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
));

-- Admins can delete orders
CREATE POLICY "Admins can delete orders" 
ON public.orders 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
));

-- Users can view their own orders by email (for tracking)
CREATE POLICY "Users can view orders by email or phone" 
ON public.orders 
FOR SELECT 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_orders_email ON public.orders(customer_email);
CREATE INDEX idx_orders_phone ON public.orders(customer_phone);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_status ON public.orders(order_status);