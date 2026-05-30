# Supabase Setup Checklist - Fix Login Issues

## 🚨 You're seeing these errors:
```
POST /auth/v1/token?grant_type=password [HTTP/2 400]
POST /rest/v1/users?on_conflict=id [HTTP/3 401]
```

## ✅ Step-by-Step Fixes

### Step 1: Fix Row Level Security (RLS) on users table

**Problem:** The `401` error on `/rest/v1/users` means RLS is blocking write access.

**Solution:** Run this SQL in your Supabase dashboard:

1. Go to: https://app.supabase.com/project/msgrvhnnaldxrovwzzjz/sql
2. Copy and paste the entire contents of `migrations/010_users_rls_policies.sql`
3. Click "Run"

**OR run this minimal version:**
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to create their own profile
CREATE POLICY "Users can create profile" ON users 
  FOR INSERT WITH CHECK (id = auth.uid());

-- Allow users to read their own profile  
CREATE POLICY "Users can read profile" ON users 
  FOR SELECT USING (auth.uid() = id);

-- Allow admins full access
CREATE POLICY "Admins full access" ON users FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );
```

### Step 2: Disable Email Confirmation (or confirm your email)

**Problem:** The `400` error on `/auth/v1/token` often means email is not confirmed.

**Check if email confirmation is required:**

1. Go to: https://app.supabase.com/project/msgrvhnnaldxrovwzzjz/auth/settings
2. Look for "Enable email confirmations"

**Option A: Disable Email Confirmation (Quick Fix)**
1. Toggle "Enable email confirmations" to **OFF**
2. Click "Save"
3. Now users can log in immediately after registration

**Option B: Keep Email Confirmation & Confirm Your Test User**
1. Find your user in: https://app.supabase.com/project/msgrvhnnaldxrovwzzjz/auth/users
2. Look for users with "Confirmation pending" or similar status
3. Resend confirmation email or manually confirm

### Step 3: Check User Exists in auth.users

**Problem:** The user might exist in your `users` table but NOT in Supabase's `auth.users` table.

**Check:**
1. Go to: https://app.supabase.com/project/msgrvhnnaldxrovwzzjz/auth/users
2. Look for your test user's email
3. **If not found:** The user was created in your `users` table but NOT in auth
   - Solution: Run the migration script or create the user manually

### Step 4: Test with a Fresh User

After applying fixes, test with a **new email** that you've never used before:

1. Go to your login page
2. Click "Create Account"
3. Use a new email (e.g., `test12345@example.com`)
4. Try to log in immediately

**If it works:** The issue was with existing users (migration needed)  
**If it fails with 400:** Email confirmation is still required (disable it in Step 2)  
**If it fails with 401:** RLS policies are still blocking (check Step 1)

### Step 5: Check Supabase URL and Keys

**Verify your `.env.local` file has correct values:**
```
VITE_SUPABASE_URL=https://msgrvhnnaldxrovwzzjz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZ3J2aG5uYWxkeHJvdnd6emp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODY1NTYsImV4cCI6MjA5NTU2MjU1Nn0.f3xTfVZqq9cURUIHIqO_23l2SHzU8xrZ6YsD3Mk646M
```

Make sure these match your Supabase project settings:
- Project URL: https://app.supabase.com/project/msgrvhnnaldxrovwzzjz/settings/general
- Anon key: https://app.supabase.com/project/msgrvhnnaldxrovwzzjz/settings/api

### Step 6: Clear Browser Cache & Test

Sometimes old sessions cause issues:

1. Clear your browser cache completely
2. Open an incognito/private window
3. Test registration and login

## 🎯 Most Common Solutions

| Error | Most Likely Cause | Solution |
|-------|------------------|----------|
| `400 /auth/v1/token` | Email not confirmed | Disable email confirmation or confirm email |
| `400 /auth/v1/token` | Wrong password | Reset password via "Forgot Password" |
| `400 /auth/v1/token` | User doesn't exist in auth | Migrate user or register again |
| `401 /rest/v1/users` | RLS blocking insert | Run the RLS migration SQL |
| `401 /rest/v1/users` | No policies on users table | Run the RLS migration SQL |

## 📞 Still Having Issues?

### Check the exact error message:

Modify `src/contexts/AuthContext.tsx` temporarily to log the full error:

```typescript
const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    console.log('SUPABASE ERROR:', error);  // Add this line
    throw new Error(error.message);
  }
  ...
};
```

Then check your browser console for the full error object. It will show:
- `error.message` - Human readable error
- `error.code` - Error code
- `error.status` - HTTP status
- `error.hint` - Additional info

### Common Supabase Auth Errors:

- `User not found` - User doesn't exist in auth.users
- `Invalid login credentials` - Wrong password
- `Email not confirmed` - User hasn't clicked confirmation link
- `Access denied` or `JWT invalid` - Token/session issue

## ✅ Quick Test Checklist

- [ ] I ran the RLS migration on my users table
- [ ] I disabled email confirmation (or confirmed my test user)
- [ ] My test user exists in Supabase Auth (auth.users)
- [ ] I'm using the correct Supabase URL and anon key
- [ ] I tested with a fresh/new email address
- [ ] I cleared my browser cache

If all checkboxes are ✅ and you're still having issues, the problem might be in your Supabase project configuration. Check:
- Project is active (not paused)
- No rate limiting
- No IP restrictions
