-- register_user RPC function with SECURITY DEFINER
-- Creates a user profile and returns the new user's UUID
-- Run in Supabase Dashboard SQL Editor

CREATE OR REPLACE FUNCTION register_user(
  p_email TEXT,
  p_username TEXT
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
AS
$$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO profiles (email, username)
  VALUES (p_email, p_username)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;
