-- Endorsement Requests: Instructor endorsement feature
-- Run this in Supabase Dashboard → SQL Editor
-- Phase 1 of Endorsements feature

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

CREATE INDEX idx_endorsement_requests_token ON public.endorsement_requests(token);
CREATE INDEX idx_endorsement_requests_achievement_id ON public.endorsement_requests(achievement_id);
CREATE INDEX idx_endorsement_requests_status ON public.endorsement_requests(achievement_id, status);

ALTER TABLE public.endorsement_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can create endorsement requests"
  ON public.endorsement_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.highlights h
      JOIN public.portfolios p ON p.id = h.portfolio_id
      WHERE h.id = achievement_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view own endorsement requests"
  ON public.endorsement_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.highlights h
      JOIN public.portfolios p ON p.id = h.portfolio_id
      WHERE h.id = achievement_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update own endorsement requests"
  ON public.endorsement_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.highlights h
      JOIN public.portfolios p ON p.id = h.portfolio_id
      WHERE h.id = achievement_id AND p.user_id = auth.uid()
    )
  );
