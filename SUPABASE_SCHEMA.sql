-- Kifolio Database Schema
-- Copy and paste this entire file into your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Portfolios table
CREATE TABLE public.portfolios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  child_name TEXT NOT NULL,
  portfolio_title TEXT NOT NULL,
  photo_url TEXT,
  template TEXT NOT NULL DEFAULT 'ren',
  is_private BOOLEAN DEFAULT false,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Achievements table
CREATE TABLE public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date_achieved DATE NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Email preferences table
CREATE TABLE public.email_preferences (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  kifolio_communications BOOLEAN DEFAULT true,
  account_activity BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Invitations table
CREATE TABLE public.invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inviter_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  invitee_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Portfolio policies
CREATE POLICY "Users can view own portfolios" ON public.portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create portfolios" ON public.portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolios" ON public.portfolios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own portfolios" ON public.portfolios FOR DELETE USING (auth.uid() = user_id);

-- Public portfolios can be viewed by anyone (for preview functionality)
CREATE POLICY "Public portfolios are viewable by everyone" ON public.portfolios FOR SELECT USING (NOT is_private);

-- Achievement policies
CREATE POLICY "Users can view achievements for own portfolios" ON public.achievements FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.portfolios 
    WHERE portfolios.id = achievements.portfolio_id 
    AND portfolios.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create achievements for own portfolios" ON public.achievements FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.portfolios 
    WHERE portfolios.id = achievements.portfolio_id 
    AND portfolios.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update achievements for own portfolios" ON public.achievements FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.portfolios 
    WHERE portfolios.id = achievements.portfolio_id 
    AND portfolios.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete achievements for own portfolios" ON public.achievements FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.portfolios 
    WHERE portfolios.id = achievements.portfolio_id 
    AND portfolios.user_id = auth.uid()
  )
);

-- Achievements for public portfolios are viewable by everyone
CREATE POLICY "Public portfolio achievements are viewable by everyone" ON public.achievements FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.portfolios 
    WHERE portfolios.id = achievements.portfolio_id 
    AND NOT portfolios.is_private
  )
);

-- Email preferences policies
CREATE POLICY "Users can view own email preferences" ON public.email_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own email preferences" ON public.email_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create own email preferences" ON public.email_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Invitation policies
CREATE POLICY "Users can view sent invitations" ON public.invitations FOR SELECT USING (auth.uid() = inviter_id);
CREATE POLICY "Users can create invitations" ON public.invitations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.email_preferences FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create user profile and email preferences
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  
  INSERT INTO public.email_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Success message
SELECT 'Kifolio database schema created successfully!' as status;
