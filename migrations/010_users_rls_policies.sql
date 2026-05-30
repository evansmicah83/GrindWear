-- Enable Row Level Security on users table and create necessary policies
-- This must be run in your Supabase SQL editor: https://app.supabase.com/project/[your-project]/sql

-- Step 1: Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 2: Allow users to read their own profile and public info
CREATE POLICY "Users can view profiles"
  ON users
  FOR SELECT
  USING (
    -- Users can see their own full profile
    auth.uid() = id OR
    -- Authenticated users can see basic info (for admin dashboard, reviews, etc.)
    (
      auth.uid() IS NOT NULL AND
      (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    )
  );

-- Step 3: Allow users to insert their own profile (critical for registration)
CREATE POLICY "Users can create their own profile"
  ON users
  FOR INSERT
  WITH CHECK (
    -- User can only insert a record with their own auth.id
    id = auth.uid()
  );

-- Step 4: Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 5: Allow public read for email uniqueness check during registration
-- This allows the frontend to check if an email is already registered
CREATE POLICY "Public can check email exists for registration"
  ON users
  FOR SELECT
  USING (
    -- Only when no user is authenticated (public signup)
    auth.uid() IS NULL
  );

-- Step 6: Admins can manage all users
CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  USING (
    -- Service role (used in server-side) can do anything
    auth.jwt() ->> 'role' = 'service_role' OR
    -- Users with admin role can manage all users
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );
