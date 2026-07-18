-- Add Payment fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS payment_details TEXT,
ADD COLUMN IF NOT EXISTS payment_qr_url TEXT;

-- Create Creator Products table
CREATE TABLE IF NOT EXISTS public.creator_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT '$',
    product_type TEXT NOT NULL, -- algo, strategy, course, pdf
    thumbnail_url TEXT,
    file_url TEXT,
    tags TEXT[],
    status TEXT DEFAULT 'draft', -- draft, active
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.creator_products ENABLE ROW LEVEL SECURITY;

-- Policies for creator_products
CREATE POLICY "Anyone can view active products" 
ON public.creator_products FOR SELECT 
USING (status = 'active');

CREATE POLICY "Creators can view their own products" 
ON public.creator_products FOR SELECT 
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can insert their own products" 
ON public.creator_products FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own products" 
ON public.creator_products FOR UPDATE 
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own products" 
ON public.creator_products FOR DELETE 
USING (auth.uid() = creator_id);


-- Create Creator Orders table
CREATE TABLE IF NOT EXISTS public.creator_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.creator_products(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    payment_proof_url TEXT,
    status TEXT DEFAULT 'pending', -- pending, completed, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.creator_orders ENABLE ROW LEVEL SECURITY;

-- Policies for creator_orders
CREATE POLICY "Buyers can view their own orders" 
ON public.creator_orders FOR SELECT 
USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view their own orders" 
ON public.creator_orders FOR SELECT 
USING (auth.uid() = seller_id);

CREATE POLICY "Buyers can insert orders" 
ON public.creator_orders FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update their own orders" 
ON public.creator_orders FOR UPDATE 
USING (auth.uid() = seller_id);
