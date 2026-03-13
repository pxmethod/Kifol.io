-- Endorsement Requests: Instructor endorsement feature
-- Run this migration in Supabase SQL Editor

-- Create endorsement_requests table
CREATE TABLE public.endorsement_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_id UUID NOT NULL REFERENCES public.highlights(id) ON DELETE CASCADE,
  instructor_name TEXT NOT NULL,
  instructor_email TEXT NOT NULL,
  relationship TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'expired')),
  comment TEXT,
  instructor_title TEXT,
  organization TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE
);

-- Index for token lookup (public endorse page)
CREATE INDEX idx_endorsement_requests_token ON public.endorsement_requests(token);

-- Index for achievement lookup (timeline display)
CREATE INDEX idx_endorsement_requests_achievement_id ON public.endorsement_requests(achievement_id);

-- Index for status filtering
CREATE INDEX idx_endorsement_requests_status ON public.endorsement_requests(achievement_id, status);

-- Enable RLS
ALTER TABLE public.endorsement_requests ENABLE ROW LEVEL SECURITY;

-- Parents can create endorsement requests for their child's achievements
CREATE POLICY "Parents can create endorsement requests"
  ON public.endorsement_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.highlights h
      JOIN public.portfolios p ON p.id = h.portfolio_id
      WHERE h.id = achievement_id AND p.user_id = auth.uid()
    )
  );

-- Parents can view endorsement requests for their child's achievements
CREATE POLICY "Parents can view own endorsement requests"
  ON public.endorsement_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.highlights h
      JOIN public.portfolios p ON p.id = h.portfolio_id
      WHERE h.id = achievement_id AND p.user_id = auth.uid()
    )
  );

-- Parents can update endorsement requests for their child's achievements (for admin)
CREATE POLICY "Parents can update own endorsement requests"
  ON public.endorsement_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.highlights h
      JOIN public.portfolios p ON p.id = h.portfolio_id
      WHERE h.id = achievement_id AND p.user_id = auth.uid()
    )
  );

-- Note: Public endorse page uses API route with service role to read/update by token (no auth)
