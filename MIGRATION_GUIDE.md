# Authentication Fix - Migration Guide

## Problem

Your login was failing with "Invalid credentials" (400 error from Supabase) even with the correct password. This was caused by a **broken fallback authentication mechanism** in `AuthContext.tsx` that:

1. Tried Supabase auth first (`signInWithPassword`)
2. If that failed, it checked the `users` table and compared bcrypt hashes
3. **But it never actually created a Supabase auth session** - it only stored user data locally
4. This meant the Supabase session token was never created, causing API calls to fail

## Solution Applied

✅ **Fixed `src/contexts/AuthContext.tsx`:**
- Removed the broken fallback mechanism
- Removed bcrypt dependency usage
- Removed local session storage (FALLBACK_SESSION_KEY)
- Now uses **only Supabase auth** for login/register
- Automatically syncs user profiles between auth.users and users table

## Migration Required for Existing Users

If you have **existing users created before this fix**, they may exist only in your `users` table with bcrypt password hashes, **not in Supabase auth**. These users will NOT be able to log in until you migrate them.

### Option 1: Manual Migration via Supabase Dashboard (Recommended)

1. Go to your Supabase dashboard: https://app.supabase.com/project/[your-project]/auth/users
2. For each user in your `users` table:
   - Click "Add User" 
   - Enter their email and a temporary password
   - Set user_metadata with their name and role
   - Click "Create User"
3. User will receive a confirmation email (if email confirmation is enabled)
4. User must use "Forgot Password" to set their real password
5. After all users are migrated, you can remove the `password_hash` column from your users table

### Option 2: Use the Migration Script

Run the provided Node.js script:

```bash
# Install dependencies
npm install @supabase/supabase-js dotenv

# Create .env file with your Supabase credentials
cp .env.local .env
# Edit .env to include:
# SUPABASE_URL=https://your-project-ref.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Run migration
node migrate_users_to_supabase_auth.js
```

The script will:
- Find users in the `users` table with `password_hash`
- Create corresponding auth users
- Clear the password_hash from the users table
- Print temporary passwords for each user

**Important:** Users must reset their passwords via the "Forgot Password" flow after migration.

### Option 3: Have Users Reset Passwords

If you don't want to migrate manually:

1. Keep the current code (no fallback, only Supabase auth)
2. Ask all users to use "Forgot Password" on the login page
3. When they reset, Supabase will create a proper auth user
4. Their profile data from the users table will be preserved

## Additional Supabase Configuration

### Enable Email Confirmation (Recommended)

1. Go to Supabase Dashboard > Authentication > Settings
2. Under "Enable email confirmations", turn it ON
3. Configure your email templates

### Disable Email Confirmation (Alternative)

If you don't want email confirmation:

1. Go to Supabase Dashboard > Authentication > Settings  
2. Turn OFF "Enable email confirmations"
3. Users can log in immediately after registration

## Files Changed

- ✅ `src/contexts/AuthContext.tsx` - Complete rewrite, removed fallback, uses only Supabase auth
- ✅ `migrate_users_to_supabase_auth.js` - Migration script (run once)
- ✅ `MIGRATION_GUIDE.md` - This file
- ✅ `migrations/002_migrate_users_to_auth.sql` - Documentation

## Testing

After migration:

1. Test new user registration:
   - Go to login page, click "Create Account"
   - Register with a new email
   - Check if you receive confirmation email (if enabled)
   - Log in with the new credentials

2. Test existing user login:
   - Use a migrated user's email
   - Use the temporary password (or their reset password)
   - Should log in successfully

3. Test admin login:
   - Log in with admin credentials
   - Should redirect to admin dashboard

## Notes

- The `bcryptjs` package remains in package.json but is no longer used. You can remove it if desired.
- The `password_hash` column in the users table can be removed after all users are migrated (backup first!)
- New users created via the register flow will automatically have entries in both auth.users and users table
