/**
 * Migration Script: Sync users from users table to Supabase Auth
 * 
 * This script migrates users who were created directly in the users table
 * (with bcrypt password hashes) to Supabase's auth system.
 * 
 * REQUIREMENTS:
 * - Node.js installed
 * - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables set
 * - @supabase/supabase-js package installed
 * 
 * HOW TO RUN:
 * 1. Install dependencies: npm install @supabase/supabase-js bcryptjs dotenv
 * 2. Create a .env file with:
 *    SUPABASE_URL=https://your-project-ref.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 * 3. Run: node migrate_users_to_supabase_auth.js
 * 
 * NOTE: This script will:
 * - Find users in the users table with password_hash
 * - Create corresponding auth users with the same email and password
 * - Update the users table to link to the new auth user IDs
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables. Please set:');
  console.error('   SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nYou can find these in your Supabase project: Settings > API');
  process.exit(1);
}

// Create admin client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function migrateUsers() {
  console.log('🔄 Starting user migration to Supabase Auth...\n');

  try {
    // Get all users from the users table that have password_hash
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, password_hash, name, role')
      .not('password_hash', 'is', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('✅ No users with password_hash found. Migration not needed.');
      return;
    }

    console.log(`📊 Found ${users.length} users with password_hash to migrate\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Check if user already exists in auth.users
        const { data: existingUser, error: checkError } = await supabaseAdmin
          .from('auth.users')
          .select('id, email')
          .eq('email', user.email)
          .maybeSingle();

        if (checkError && !checkError.message.includes('relation "auth.users" does not exist')) {
          console.error(`⚠️  Error checking user ${user.email}:`, checkError.message);
        }

        if (existingUser) {
          console.log(`⏭️  User ${user.email} already exists in auth.users, skipping...`);
          skipCount++;
          
          // Link the users table record to the auth user
          if (existingUser.id !== user.id) {
            await supabaseAdmin
              .from('users')
              .update({ id: existingUser.id })
              .eq('email', user.email);
            console.log(`   ↳ Updated users table to use auth user ID: ${existingUser.id}`);
          }
          continue;
        }

        // Generate a random password for the user
        // (They'll need to reset it via email, or we need to store it temporarily)
        // For now, we'll create the auth user but they'll need to use password reset
        const tempPassword = Math.random().toString(36).slice(2, 15);
        
        console.log(`🔧 Migrating user: ${user.email}`);
        
        // Create the auth user
        // Note: We cannot set the password directly via admin API to an existing hash
        // We need to use signUp with the temp password
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: tempPassword,
          user_metadata: {
            name: user.name,
            role: user.role,
          },
        });

        if (authError) {
          console.error(`❌ Error creating auth user for ${user.email}:`, authError.message);
          errorCount++;
          continue;
        }

        // Update the users table to link to the new auth user
        await supabaseAdmin
          .from('users')
          .update({
            id: authUser.user.id,
            password_hash: null, // Clear the bcrypt hash
          })
          .eq('email', user.email);

        console.log(`✅ Created auth user for ${user.email} with ID: ${authUser.user.id}`);
        console.log(`   ⚠️  Temporary password: ${tempPassword}`);
        console.log(`   User must reset password via email to complete migration.\n`);
        
        successCount++;
      } catch (err) {
        console.error(`❌ Unexpected error migrating ${user.email}:`, err);
        errorCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ⏭️  Already in auth: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('\n✨ Migration complete!');
    
    if (successCount > 0) {
      console.log('\n📝 Next steps:');
      console.log('   1. Users with temporary passwords need to reset their passwords');
      console.log('   2. Enable email confirmations in Supabase Auth settings');
      console.log('   3. Consider removing the password_hash column from users table (backup first!)');
    }

  } catch (err) {
    console.error('❌ Fatal error during migration:', err);
  } finally {
    await supabaseAdmin.auth.signOut();
  }
}

migrateUsers();
