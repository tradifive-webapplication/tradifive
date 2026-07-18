-- Create creator_products table
CREATE TABLE public.creator_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    product_type TEXT NOT NULL DEFAULT 'course', -- 'course', 'signal', 'subscription'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'draft', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for creator_products
ALTER TABLE public.creator_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active creator products" ON public.creator_products FOR SELECT
USING (status = 'active' OR auth.uid() = creator_id);

CREATE POLICY "Creators can manage their own products" ON public.creator_products
FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

-- Create mentor_students table
CREATE TABLE public.mentor_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tier TEXT NOT NULL DEFAULT 'Beginner', -- 'Beginner', 'Intermediate', 'Advanced'
    status TEXT NOT NULL DEFAULT 'active',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentor_id, student_id)
);

-- Enable RLS for mentor_students
ALTER TABLE public.mentor_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors can view their students" ON public.mentor_students FOR SELECT
USING (auth.uid() = mentor_id);

CREATE POLICY "Students can view their mentors" ON public.mentor_students FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Mentors can manage their students" ON public.mentor_students
FOR ALL USING (auth.uid() = mentor_id) WITH CHECK (auth.uid() = mentor_id);
