# 💰 Revenue Test Execution Guide

## 🎯 Pre-Flight Checklist

### 1. **Stripe Configuration**
- [ ] `VITE_STRIPE_PUBLIC_KEY` is set in Vercel environment variables
- [ ] Stripe webhook endpoint is configured in Stripe Dashboard
- [ ] Webhook secret is set in Vercel environment variables

### 2. **Local Testing (Optional)**
If testing locally, ensure:
- [ ] Stripe CLI is installed: `stripe --version`
- [ ] Stripe CLI is logged in: `stripe login`
- [ ] Webhook listener is running: `stripe listen --forward-to localhost:5173/api/stripe-webhook`

### 3. **Database Access**
- [ ] You have access to Supabase Dashboard
- [ ] You know your test user's email or user ID

---

## 🧪 Test Execution Steps

### Step 1: Hard Refresh
1. Go to your live Zyeuté URL
2. Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. Verify console is clean (no red errors)

### Step 2: Login
1. Sign in with your test account
2. Verify profile loads correctly
3. Note your user email (you'll need it for verification)

### Step 3: Navigate to Premium Page
1. Click on "Premium" or "VIP" in navigation
2. You should see tier options (Bronze, Silver, Gold)

### Step 4: Initiate Payment
1. Click "S'abonner" on a tier (e.g., Silver $9.99)
2. **If Stripe is configured:**
   - You'll be redirected to Stripe Checkout
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - Complete the payment
3. **If in demo mode:**
   - You'll see a toast: "Demo Mode: Stripe non configuré"
   - This means Stripe keys are not configured

### Step 5: Wait for Webhook Processing
- Wait 10-30 seconds for webhook to process
- Check Stripe Dashboard → Webhooks for delivery status

---

## ✅ Database Verification

### Option A: Using the Verification Script (Recommended)

1. **Install dotenv if needed:**
   ```bash
   npm install dotenv
   ```

2. **Create `.env.local` file** (if it doesn't exist):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Run the verification script:**
   ```bash
   node scripts/verify-premium-status.js your-test-email@example.com
   ```
   
   Or with user ID:
   ```bash
   node scripts/verify-premium-status.js 123e4567-e89b-12d3-a456-426614174000
   ```

4. **The script will output:**
   - ✅ Success if all fields are correct
   - ❌ Failed if premium status is not set
   - ⚠️ Partial if some fields are missing

### Option B: Manual Supabase Dashboard Check

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Table Editor** → **user_profiles**
4. Find your test user (filter by email or search)
5. Check these fields:

| Field | Expected Value | Your Result |
|------|----------------|-------------|
| `is_premium` | `true` | ? |
| `subscription_tier` | `'bronze'`, `'silver'`, or `'gold'` | ? |
| `stripe_customer_id` | `cus_xxxxx` (not NULL) | ? |
| `plan` | May be updated | ? |

---

## 📊 Expected Results

### ✅ **SUCCESS** (All working correctly):
```
is_premium: true
subscription_tier: 'silver' (or selected tier)
stripe_customer_id: 'cus_xxxxx'
```

### ⚠️ **PARTIAL** (Webhook may have issues):
```
is_premium: true
subscription_tier: 'silver'
stripe_customer_id: NULL
```

### ❌ **FAILED** (Payment/webhook didn't work):
```
is_premium: false
subscription_tier: NULL
stripe_customer_id: NULL
```

---

## 🐛 Troubleshooting

### If `is_premium` is still `false`:

1. **Check Stripe Dashboard:**
   - Go to https://dashboard.stripe.com/payments
   - Verify payment succeeded
   - Check webhook logs: https://dashboard.stripe.com/webhooks

2. **Check Webhook Delivery:**
   - In Stripe Dashboard → Webhooks
   - Look for `checkout.session.completed` events
   - Check if webhook was delivered successfully
   - Check if webhook returned 200 status

3. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Check `stripe-webhook` function logs
   - Look for errors or failed requests

4. **Verify Environment Variables:**
   - Check Vercel Dashboard → Settings → Environment Variables
   - Ensure `STRIPE_WEBHOOK_SECRET` is set
   - Ensure `STRIPE_SECRET_KEY` is set
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set

---

## 📝 Report Template

After completing the test, fill in this report:

```
═══════════════════════════════════════════════════════
💰 REVENUE TEST RESULTS
═══════════════════════════════════════════════════════

Test User: [your-email@example.com]
Test Date: [date/time]
Tier Selected: [bronze/silver/gold]
Payment Amount: [$X.XX]

DATABASE VERIFICATION:
✅ is_premium: [true/false]
✅ subscription_tier: [value or NULL]
✅ stripe_customer_id: [cus_xxxxx or NULL]

STRIPE VERIFICATION:
✅ Payment Status: [succeeded/failed]
✅ Webhook Delivered: [yes/no]
✅ Webhook Status: [200/other]

VERDICT:
[✅ SUCCESS / ⚠️ PARTIAL / ❌ FAILED]

NOTES:
[Any additional observations]
═══════════════════════════════════════════════════════
```

---

## 🎉 Success Criteria

**The test is successful if:**
- ✅ Payment completes in Stripe
- ✅ Webhook is delivered successfully
- ✅ `is_premium` is set to `true`
- ✅ `subscription_tier` matches selected tier
- ✅ `stripe_customer_id` is populated

**You're ready for production when all checks pass!** 🚀

