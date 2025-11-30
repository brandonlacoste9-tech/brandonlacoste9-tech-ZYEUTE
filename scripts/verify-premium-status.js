/**
 * 💰 Premium Status Verification Script
 * 
 * Run this script after completing a payment test to verify:
 * - is_premium status
 * - subscription_tier
 * - stripe_customer_id
 * 
 * Usage:
 *   node scripts/verify-premium-status.js <user-email-or-id>
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('\nRequired environment variables:');
  console.error('  - VITE_SUPABASE_URL or SUPABASE_URL');
  console.error('  - VITE_SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n💡 Tip: Create a .env.local file with these values');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPremiumStatus(userIdentifier) {
  console.log('\n🔍 Verifying Premium Status...\n');
  console.log(`Searching for user: ${userIdentifier}\n`);

  try {
    // Try to find user by email or ID
    let query = supabase
      .from('user_profiles')
      .select('*');

    // Check if it's a UUID (ID) or email
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdentifier);
    
    if (isUUID) {
      query = query.eq('id', userIdentifier);
    } else {
      query = query.eq('email', userIdentifier);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('❌ Error fetching user:', error.message);
      process.exit(1);
    }

    if (!data) {
      console.error('❌ User not found!');
      process.exit(1);
    }

    // Display results
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 PREMIUM STATUS VERIFICATION REPORT');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('👤 User Information:');
    console.log(`   Email: ${data.email || 'N/A'}`);
    console.log(`   Username: ${data.username || 'N/A'}`);
    console.log(`   Display Name: ${data.display_name || 'N/A'}`);
    console.log(`   User ID: ${data.id}\n`);

    console.log('💰 Premium Status:');
    const isPremium = data.is_premium === true;
    const statusIcon = isPremium ? '✅' : '❌';
    console.log(`   ${statusIcon} is_premium: ${data.is_premium}`);
    console.log(`   ${statusIcon} subscription_tier: ${data.subscription_tier || 'NULL'}`);
    console.log(`   ${statusIcon} stripe_customer_id: ${data.stripe_customer_id || 'NULL'}`);
    console.log(`   Plan: ${data.plan || 'N/A'}\n`);

    // Final verdict
    console.log('═══════════════════════════════════════════════════════');
    if (isPremium && data.subscription_tier && data.stripe_customer_id) {
      console.log('✅ SUCCESS: Payment flow is working correctly!');
      console.log(`   User has active ${data.subscription_tier} subscription`);
    } else if (isPremium && data.subscription_tier) {
      console.log('⚠️  PARTIAL: Premium status set, but missing stripe_customer_id');
      console.log('   This might indicate a webhook issue');
    } else {
      console.log('❌ FAILED: Premium status not activated');
      console.log('   Possible issues:');
      console.log('   - Payment did not complete');
      console.log('   - Webhook not received/processed');
      console.log('   - Stripe integration not configured');
    }
    console.log('═══════════════════════════════════════════════════════\n');

    // Return structured data for programmatic use
    return {
      success: isPremium && data.subscription_tier && data.stripe_customer_id,
      is_premium: data.is_premium,
      subscription_tier: data.subscription_tier,
      stripe_customer_id: data.stripe_customer_id,
      plan: data.plan,
    };

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Get user identifier from command line
const userIdentifier = process.argv[2];

if (!userIdentifier) {
  console.error('❌ Missing user identifier!');
  console.error('\nUsage:');
  console.error('  node scripts/verify-premium-status.js <user-email-or-id>');
  console.error('\nExample:');
  console.error('  node scripts/verify-premium-status.js test@example.com');
  console.error('  node scripts/verify-premium-status.js 123e4567-e89b-12d3-a456-426614174000');
  process.exit(1);
}

// Run verification
verifyPremiumStatus(userIdentifier)
  .then((result) => {
    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

