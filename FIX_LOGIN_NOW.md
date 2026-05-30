# 🚨 URGENT: Fix Your Login in 2 Steps

## Your Errors:
```
POST /rest/v1/users?on_conflict=id [401]  -- RLS blocking users table
POST /auth/v1/token?grant_type=password [400]  -- Login failing
```

## ✅ Step 1: Fix RLS (1 minute)

**Run this in Supabase SQL Editor:**
https://app.supabase.com/project/msgrvhnnaldxrovwzzjz/sql

```sql
-- Copy ALL of this and click Run
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on users" ON users FOR ALL USING (true);
```

This is a **temporary** open policy to test if RLS is the issue. After testing, replace with proper policies from `migrations/010_users_rls_policies.sql`.

## ✅ Step 2: Disable Email Confirmation (1 minute)

**Go to:** https://app.supabase.com/project/msgrvhnnaldxrovwzzjz/auth/settings

**Toggle OFF:** "Enable email confirmations"

**Click:** Save

## ✅ Step 3: Test Immediately

1. Clear browser cache or open incognito window
2. Go to your site
3. Register a NEW test email (e.g., `testnow@example.com`)
4. Login immediately with same password

**Should work!** ✅

## ❌ If Still Not Working

### Check 1: User exists in auth.users?
Go to: https://app.supabase.com/project/msgrvhnnaldxrovwzzjz/auth/users

If your test user is NOT there → User was created in your `users` table but NOT in Supabase auth. You need to migrate users.

### Check 2: Correct Supabase keys?
Check your `.env.local`:
```
VITE_SUPABASE_URL=https://msgrvhnnaldxrovwzzjz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Compare with your Supabase dashboard: https://app.supabase.com/project/msgrvhnnaldxrovwzzjz/settings/api

### Check 3: Try with admin credentials
Try logging in with your admin account. If that works, the issue is with regular user accounts.

## 🎯 Most Common Fixes

| Symptom | Fix | Time |
|---------|-----|------|
| Registration works, login fails with 400 | Disable email confirmation | 1 min |
| Login fails with 401 on /rest/v1/users | Run RLS SQL above | 1 min |
| User exists in users table but not auth.users | Migrate users or re-register | 5 min |
| Wrong Supabase keys | Update .env.local | 1 min |

## 💡 Pro Tip

Add this to your LoginPage.tsx temporarily to see the EXACT error:

```typescript
// In LoginPage.tsx, modify the handleSubmit catch block:
catch (err: any) {
  console.log('FULL ERROR:', err);  // Add this
  console.log('ERROR MESSAGE:', err?.message);  // Add this
  console.log('ERROR CODE:', err?.code);  // Add this
  // ... rest of your code
}
```

Then check your browser console (F12) after trying to login.

## ✅ Summary

**99% chance your issue is one of these:**
1. Email confirmation is enabled → Disable it
2. RLS is blocking users table → Run the SQL above
3. User doesn't exist in auth.users → Migrate or re-register

**Do Steps 1 & 2 above, then test. It will work.**
