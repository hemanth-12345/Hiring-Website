-- Create role enum
CREATE TYPE public.app_role AS ENUM ('candidate', 'employer', 'admin');

-- Create verification status enum
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Create rating tier enum
CREATE TYPE public.rating_tier AS ENUM ('bronze', 'silver', 'gold');

-- Create contact request status enum
CREATE TYPE public.contact_request_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  resume_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  verification_status verification_status DEFAULT 'pending',
  rating_tier rating_tier,
  profile_completeness INTEGER DEFAULT 0,
  is_contact_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create contact_requests table
CREATE TABLE public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  status contact_request_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (employer_id, candidate_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
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

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Verified profiles are viewable by employers"
ON public.profiles FOR SELECT
USING (
  verification_status = 'verified' 
  AND public.has_role(auth.uid(), 'employer')
);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own role on signup"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Contact requests policies
CREATE POLICY "Employers can create contact requests"
ON public.contact_requests FOR INSERT
WITH CHECK (
  auth.uid() = employer_id 
  AND public.has_role(auth.uid(), 'employer')
);

CREATE POLICY "Users can view their contact requests"
ON public.contact_requests FOR SELECT
USING (auth.uid() = employer_id OR auth.uid() = candidate_id);

CREATE POLICY "Candidates can update request status"
ON public.contact_requests FOR UPDATE
USING (auth.uid() = candidate_id);

-- Function to calculate profile completeness
CREATE OR REPLACE FUNCTION public.calculate_profile_completeness()
RETURNS TRIGGER AS $$
DECLARE
  completeness INTEGER := 0;
BEGIN
  IF NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN completeness := completeness + 15; END IF;
  IF NEW.location IS NOT NULL AND NEW.location != '' THEN completeness := completeness + 10; END IF;
  IF NEW.bio IS NOT NULL AND NEW.bio != '' THEN completeness := completeness + 15; END IF;
  IF array_length(NEW.skills, 1) > 0 THEN completeness := completeness + 20; END IF;
  IF NEW.experience_years > 0 THEN completeness := completeness + 10; END IF;
  IF NEW.resume_url IS NOT NULL THEN completeness := completeness + 15; END IF;
  IF NEW.linkedin_url IS NOT NULL OR NEW.github_url IS NOT NULL OR NEW.portfolio_url IS NOT NULL THEN 
    completeness := completeness + 15; 
  END IF;
  
  NEW.profile_completeness := completeness;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profile completeness
CREATE TRIGGER update_profile_completeness
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.calculate_profile_completeness();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Timestamp triggers
CREATE TRIGGER update_contact_requests_updated_at
BEFORE UPDATE ON public.contact_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();