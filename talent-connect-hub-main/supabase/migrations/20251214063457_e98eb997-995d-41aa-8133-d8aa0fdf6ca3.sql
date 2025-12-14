-- Fix function search_path for calculate_profile_completeness
CREATE OR REPLACE FUNCTION public.calculate_profile_completeness()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix function search_path for update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;