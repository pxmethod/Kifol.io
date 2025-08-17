# Supabase Setup Guide for Kifolio

## 🚀 Step 1: Create Your Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Click "Start your project"** and sign up/sign in
3. **Create a new project:**
   - **Organization**: Create new or use existing
   - **Project name**: `kifolio-app`
   - **Database password**: Generate a secure password (save this!)
   - **Region**: Choose closest to your location
   - **Pricing plan**: Free tier is perfect for now

4. **Wait for setup** (usually 2-3 minutes)

## 🔑 Step 2: Get Your Project Credentials

Once your project is ready:

1. **Go to Settings → API** in your Supabase dashboard
2. **Copy these values** (you'll need them next):
   - **Project URL** (starts with `https://xyz.supabase.co`)
   - **Project API keys → anon/public** (starts with `eyJhbGciOi...`)

## 📝 Step 3: Add Environment Variables

Create/update your `.env.local` file with these new variables:

```bash
# Existing email configuration
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=Kifolio <onboarding@resend.dev>
EMAIL_DOMAIN=kifol.io
SUPPORT_EMAIL=john@kifol.io
NEXT_PUBLIC_APP_URL=http://localhost:3001

# New Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Replace:**
- `your_project_url_here` with your Project URL
- `your_anon_key_here` with your anon/public key

## 🗄️ Step 4: Create Database Schema

In your Supabase dashboard:

1. **Go to "SQL Editor"**
2. **Click "New query"**
3. **Copy and paste this schema:**

```sql
-- Enable Row Level Security
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

-- Row Level Security Policies
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
CREATE POLICY "Users can create invitations" ON public.invitations FOR INSERT WITH CHECK (auth.uid() = inviter_id);

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
```

4. **Click "Run"** to execute the schema

## ✅ Step 5: Test Connection

Once you've added the environment variables, I'll help you test the connection!

## 🔧 Next Steps

After completing the setup above, let me know and I'll help you:

1. ✅ Test the database connection
2. ✅ Set up authentication in your app
3. ✅ Create database service functions
4. ✅ Replace localStorage with database operations

## 🆘 Troubleshooting

**Common issues:**
- **Environment variables**: Make sure to restart your dev server after adding them
- **Schema errors**: Check the SQL Editor for any error messages
- **API key issues**: Double-check you're using the "anon/public" key, not the "service_role" key

Ready? Let me know when you've completed steps 1-4! 🚀

