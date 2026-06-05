-- Org admins authenticate via auth.users + org_members only.
-- Skip public.users / email_preferences when signup metadata marks an org account.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF COALESCE((NEW.raw_user_meta_data->>'org_signup')::boolean, false) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');

  INSERT INTO public.email_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
