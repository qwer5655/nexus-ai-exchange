-- =======================================
-- NEXUS AI EXCHANGE — Fix Admin Authentication
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/dcfwldxwyvvotvfdnywy/sql/new
-- =======================================
--
-- This fixes the admin user so Supabase Auth signInWithPassword() works.
-- The root cause: the admin user was created via direct SQL insert
-- without the auth.identities record that Supabase Auth requires.
--

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the user ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'benjoka912@gmail.com';
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User not found in auth.users. Creating new user...';
    -- Insert into auth.users with proper fields
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, confirmation_token)
    VALUES (v_user_id, '00000000-0000-0000-0000-000000000000', 'benjoka912@gmail.com',
      crypt('Admin1234!', gen_salt('bf', 10)), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"username":"benjoka"}'::jsonb, now(), now(), 'authenticated', '');
  END IF;

  -- Create identity record (this is what signInWithPassword needs)
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', 'benjoka912@gmail.com'),
    'email', 'benjoka912@gmail.com', now(), now(), now())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  -- Ensure profile exists with admin role
  INSERT INTO public.profiles (id, email, username, role, balance, referral_code)
  VALUES (v_user_id, 'benjoka912@gmail.com', 'benjoka', 'admin', 10000, 'ADMIN001')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';

  RAISE NOTICE 'Admin user fixed: %', v_user_id;
END $$;

-- Verify
SELECT u.email, u.email_confirmed_at, i.provider, i.provider_id, p.role
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id AND i.provider = 'email'
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'benjoka912@gmail.com';

--
-- After running this SQL:
-- 1. Go to http://localhost:4300 (or https://proodd.com)
-- 2. Login with: benjoka912@gmail.com / Admin1234!
-- 3. Go to /admin
