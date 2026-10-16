-- 1. Update Profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_qr_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_details text;

-- 2. Create creator_products table
CREATE TABLE IF NOT EXISTS public.creator_products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    product_type text NOT NULL, -- 'course', 'pdf', 'algo', 'mentorship'
    price numeric DEFAULT 0 NOT NULL,
    currency text DEFAULT 'USD',
    file_url text, -- The secure file in supabase storage
    thumbnail_url text,
    tags text[],
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'active')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create creator_orders table
CREATE TABLE IF NOT EXISTS public.creator_orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES public.creator_products(id) ON DELETE SET NULL,
    buyer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    seller_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount numeric NOT NULL,
    payment_proof_url text, -- Link to uploaded screenshot
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security
ALTER TABLE public.creator_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_orders ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for creator_products
-- Anyone can view active products
CREATE POLICY "Anyone can view active products" ON public.creator_products
    FOR SELECT USING (status = 'active');

-- Creators can view all their own products (even drafts)
CREATE POLICY "Creators can view their own products" ON public.creator_products
    FOR SELECT USING (auth.uid() = creator_id);

-- Creators can insert their own products
CREATE POLICY "Creators can insert products" ON public.creator_products
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own products
CREATE POLICY "Creators can update products" ON public.creator_products
    FOR UPDATE USING (auth.uid() = creator_id);

-- Creators can delete their own products
CREATE POLICY "Creators can delete products" ON public.creator_products
    FOR DELETE USING (auth.uid() = creator_id);


-- 6. RLS Policies for creator_orders
-- Buyers can view their own orders
CREATE POLICY "Buyers can view their orders" ON public.creator_orders
    FOR SELECT USING (auth.uid() = buyer_id);

-- Sellers can view orders made to them
CREATE POLICY "Sellers can view their orders" ON public.creator_orders
    FOR SELECT USING (auth.uid() = seller_id);

-- Buyers can insert orders
CREATE POLICY "Buyers can insert orders" ON public.creator_orders
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Sellers can update order status (approve/reject)
CREATE POLICY "Sellers can update orders" ON public.creator_orders
    FOR UPDATE USING (auth.uid() = seller_id);
