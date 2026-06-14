-- RPC function for user registration
-- Run this in Supabase Dashboard SQL Editor
CREATE OR REPLACE FUNCTION register_user(
  p_email TEXT,
  p_username TEXT
)
RETURNS UUID
LANGUAGE plpgsql
AS 
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO profiles (
    email,
    username
  )
  VALUES (
    p_email,
    p_username
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
;
