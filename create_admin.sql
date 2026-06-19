-- 在 Supabase SQL Editor 中运行此 SQL
-- 创建一个管理员账号

-- 生成 UUID（固定方便记住）
-- 密码: Admin1234!

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, confirmation_sent_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token,
  email_change, email_change_token_new, 
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@proodd.com',
  crypt('Admin1234!', gen_salt('bf')),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"admin"}',
  now(), now(), '', '', '', 'authenticated'
);

INSERT INTO identities (
  id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000001'::text, 'admin@proodd.com')::jsonb,
  'email', now(), now(), now()
);

-- 创建 profile
INSERT INTO public.profiles (id, email, username, role, balance, referral_code)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@proodd.com', 'admin', 'admin', 10000, 'ADMIN001'
);

-- 验证
SELECT id, email, username, role FROM profiles WHERE email = 'admin@proodd.com';

-- 登录信息：
-- 邮箱: admin@proodd.com
-- 密码: Admin1234!
