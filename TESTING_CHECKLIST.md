# 🧪 ZYEUTÉ - COMPREHENSIVE BUG TEST CHECKLIST

**Date**: November 26, 2025  
**Version**: 2.0 (Post-Stripe Integration)  
**Tester**: Ready to ship! 🚀

---

## 🎯 TESTING STRATEGY

### Priority Levels:
- 🔴 **P0 - Critical**: Must work for launch
- 🟡 **P1 - High**: Important features
- 🟢 **P2 - Medium**: Nice to have
- 🔵 **P3 - Low**: Polish items

---

## 1️⃣ AUTHENTICATION & ONBOARDING 🔴 P0

### Sign Up Flow
- [ ] Email/password registration works
- [ ] Email validation (proper format)
- [ ] Password strength requirements
- [ ] Duplicate email handling
- [ ] Welcome email sent (if configured)
- [ ] Auto-login after signup
- [ ] Profile created in database

### Login Flow
- [ ] Email/password login works
- [ ] "Remember me" functionality
- [ ] Error messages for wrong credentials
- [ ] Password reset link works
- [ ] Session persistence
- [ ] Logout functionality

### Profile Setup
- [ ] Username selection (unique check)
- [ ] Avatar upload works
- [ ] Bio text saves correctly
- [ ] Location dropdown (Quebec regions)
- [ ] Profile displays correctly

---

## 2️⃣ CORE POSTING FEATURES 🔴 P0

### Create Post
- [ ] Image upload works (JPG, PNG, WEBP)
- [ ] Video upload works (MP4, MOV)
- [ ] File size validation (max 50MB)
- [ ] Caption input (max 2,200 chars)
- [ ] Hashtag detection (#poutine)
- [ ] Location tagging
- [ ] Ti-Guy AI caption generation
- [ ] AI moderation check before posting
- [ ] Post appears in feed immediately
- [ ] Post saves to database

### View Posts
- [ ] Feed loads on homepage
- [ ] Infinite scroll works
- [ ] Video autoplay on scroll
- [ ] Video mute/unmute toggle
- [ ] Fire button works (increments count)
- [ ] Fire animation displays
- [ ] Comment count accurate
- [ ] Share button works
- [ ] Post detail page loads
- [ ] User profile link works

### Edit/Delete Posts
- [ ] Edit caption works
- [ ] Delete post confirmation
- [ ] Post removed from feed
- [ ] Database updated correctly

---

## 3️⃣ STORIES FEATURE 🟡 P1

### Create Story
- [ ] Story creator opens
- [ ] Image/video upload
- [ ] Text overlay works
- [ ] Drawing tools work
- [ ] Filters apply correctly
- [ ] 24-hour expiry set
- [ ] Story appears in carousel
- [ ] Story saves to database

### View Stories
- [ ] Story carousel displays
- [ ] Story viewer opens on tap
- [ ] Auto-advance after 5 seconds
- [ ] Tap left/right navigation
- [ ] Progress bar shows correctly
- [ ] View count increments
- [ ] Stories expire after 24h
- [ ] Expired stories removed

---

## 4️⃣ COMMENTS & ENGAGEMENT 🟡 P1

### Comments
- [ ] Add comment works
- [ ] Comment displays immediately
- [ ] AI moderation check
- [ ] Nested replies work
- [ ] Comment reactions (fire, heart)
- [ ] Delete own comment
- [ ] Report comment
- [ ] Comment count updates

### Interactions
- [ ] Fire button (like)
- [ ] Fire count updates
- [ ] Fire animation plays
- [ ] User can un-fire
- [ ] Fire level system works
- [ ] Profile shows fire stats

---

## 5️⃣ SEARCH & DISCOVERY 🟡 P1

### Search
- [ ] Search bar opens
- [ ] Search by username
- [ ] Search by hashtag
- [ ] Search by caption text
- [ ] Search by location
- [ ] Results display correctly
- [ ] No results message
- [ ] Recent searches saved

### Explore Page
- [ ] Trending posts load
- [ ] Filter by region works
- [ ] Filter by hashtag works
- [ ] Popular hashtags display
- [ ] Quebec regions filter
- [ ] Grid layout responsive

---

## 6️⃣ USER PROFILES 🟡 P1

### Own Profile
- [ ] Profile page loads
- [ ] Posts grid displays
- [ ] Edit profile button
- [ ] Settings button
- [ ] Stats accurate (posts, followers, fires)
- [ ] Bio displays correctly
- [ ] Avatar displays

### Other Users
- [ ] Profile loads
- [ ] Follow/unfollow button
- [ ] Follower count updates
- [ ] Posts grid displays
- [ ] Can't edit other profiles
- [ ] Report user option
- [ ] Block user option

---

## 7️⃣ AI FEATURES (TI-GUY) 🟡 P1

### AI Caption Generation
- [ ] Ti-Guy button appears
- [ ] Caption generates in joual
- [ ] Multiple variations option
- [ ] Hashtag suggestions
- [ ] Quebec cultural context
- [ ] Generation speed < 3 seconds
- [ ] Error handling

### Voice Mode (Ti-Guy Voice)
- [ ] Microphone button works
- [ ] Speech recognition starts
- [ ] Voice commands work
- [ ] Caption generated from voice
- [ ] Ti-Guy speaks responses
- [ ] Different personality modes
- [ ] Works in French/joual

### AI Image Generator (Artiste)
- [ ] Page loads at `/artiste`
- [ ] Text prompt input works
- [ ] Image generates (DALL-E/Gemini)
- [ ] Loading state displays
- [ ] Generated image displays
- [ ] Download image works
- [ ] Post to feed option
- [ ] Remix feature works
- [ ] Credit system (if premium)

### AI Video Editor (Studio)
- [ ] Page loads at `/studio`
- [ ] Video upload works
- [ ] Auto-highlight detection
- [ ] Auto-caption generation
- [ ] Smart trimming
- [ ] Preview playback
- [ ] Export video works
- [ ] Processing time reasonable

---

## 8️⃣ CONTENT MODERATION 🔴 P0

### AI Moderation
- [ ] Text content analyzed
- [ ] Image content analyzed
- [ ] Video content analyzed
- [ ] Severity levels correct
- [ ] Quebec-aware context
- [ ] Blocked content rejected
- [ ] Warning messages display
- [ ] Appeals process works

### User Reports
- [ ] Report modal opens
- [ ] Quebec categories display
- [ ] Report submits successfully
- [ ] Admin dashboard shows reports
- [ ] Moderator can review
- [ ] Actions taken (warn/ban)
- [ ] User notified of action

### Strike System
- [ ] Strikes recorded correctly
- [ ] Strike count displays
- [ ] Temporary bans work
- [ ] Permanent bans work
- [ ] Appeal process available

---

## 9️⃣ GAMIFICATION & ACHIEVEMENTS 🟡 P1

### Achievement System
- [ ] Achievements unlock automatically
- [ ] Confetti animation plays
- [ ] Achievement modal displays
- [ ] Points awarded correctly
- [ ] Cennes awarded correctly
- [ ] Badge added to profile
- [ ] Progress tracked
- [ ] Tier system works

### Daily Challenges
- [ ] Challenges page loads
- [ ] Daily challenges display
- [ ] Weekly quests display
- [ ] Progress tracking works
- [ ] Completion detection
- [ ] Rewards distributed
- [ ] Streak counter works
- [ ] Leaderboard updates

### Tiers
- [ ] Tier progression works
- [ ] Tier badges display
- [ ] Tier benefits unlock
- [ ] Tier displayed on profile

---

## 🔟 MONETIZATION FEATURES 🟡 P1

### Premium Subscriptions (VIP)
- [ ] Premium page loads
- [ ] Three tiers display (Bronze/Silver/Gold)
- [ ] Benefits listed correctly
- [ ] Subscribe button works
- [ ] Stripe checkout opens
- [ ] Payment processes
- [ ] Subscription activated
- [ ] Premium features unlock
- [ ] Badge displays on profile
- [ ] Cancel subscription works

### Creator Subscriptions
- [ ] Creator can create tiers
- [ ] Tier pricing works (min $4.99)
- [ ] Benefits customizable
- [ ] Users can subscribe
- [ ] Exclusive content marked
- [ ] Non-subscribers see preview
- [ ] Revenue tracked correctly
- [ ] 70/30 split calculated
- [ ] Payout requests work

### Marketplace
- [ ] Marketplace page loads
- [ ] Products display in grid
- [ ] Search/filter works
- [ ] Product detail page
- [ ] List product works
- [ ] Image upload for products
- [ ] Price in CAD
- [ ] Purchase button works
- [ ] Stripe checkout opens
- [ ] Order created
- [ ] Seller notified
- [ ] Reviews work
- [ ] Platform fee calculated (15%)

### Virtual Gifts
- [ ] Gift modal opens
- [ ] Gift tiers display
- [ ] Gift animations work
- [ ] Cennes deducted
- [ ] Creator receives cennes
- [ ] Gift leaderboard updates
- [ ] Special effects display

### Creator Revenue Dashboard
- [ ] Dashboard loads at `/revenue`
- [ ] Total earnings accurate
- [ ] MRR (Monthly Recurring Revenue) correct
- [ ] Subscriber count accurate
- [ ] Growth stats display
- [ ] Earnings history
- [ ] Payout request button
- [ ] Minimum $100 enforced
- [ ] Stripe Connect integration

---

## 1️⃣1️⃣ LIVE STREAMING 🟡 P1

### Go Live
- [ ] Go Live page loads
- [ ] Camera permission requested
- [ ] Camera preview displays
- [ ] Microphone works
- [ ] Stream title input
- [ ] Start stream button
- [ ] Stream goes live
- [ ] Viewer count displays
- [ ] Chat works
- [ ] End stream button

### Watch Live
- [ ] Live streams discover page
- [ ] Active streams display
- [ ] Stream thumbnail shows
- [ ] Join stream works
- [ ] Video plays smoothly
- [ ] Chat displays
- [ ] Send chat message
- [ ] Reactions work (fire, heart)
- [ ] Send gifts during stream
- [ ] Leave stream works

---

## 1️⃣2️⃣ SETTINGS & LEGAL 🟡 P1

### Settings Page
- [ ] Settings page loads
- [ ] All sections display
- [ ] Account settings work
- [ ] Privacy settings work
- [ ] Notification settings work
- [ ] Security settings work
- [ ] Appearance settings work
- [ ] Theme toggle (light/dark)
- [ ] Language toggle (FR/EN)
- [ ] Edge lighting customization
- [ ] Voice settings
- [ ] Blocked users list
- [ ] Restricted users list

### Legal Pages
- [ ] Terms of Service loads
- [ ] Privacy Policy loads
- [ ] Community Guidelines loads
- [ ] Cookie Policy loads
- [ ] All sections display
- [ ] Links work
- [ ] Contact info correct
- [ ] GDPR compliant
- [ ] Quebec Law 25 compliant

---

## 1️⃣3️⃣ NOTIFICATIONS 🟡 P1

### Real-time Notifications
- [ ] Notification bell icon
- [ ] Badge count displays
- [ ] Notification dropdown
- [ ] New follower notification
- [ ] New comment notification
- [ ] Fire notification
- [ ] Gift received notification
- [ ] Subscription notification
- [ ] Achievement unlocked notification
- [ ] Mark as read works
- [ ] Clear all works

---

## 1️⃣4️⃣ MOBILE RESPONSIVENESS 🔴 P0

### Mobile Layout
- [ ] Header responsive
- [ ] Bottom nav displays
- [ ] Feed grid responsive
- [ ] Story carousel swipeable
- [ ] Video player full-width
- [ ] Comments readable
- [ ] Forms usable
- [ ] Buttons tappable (44px min)
- [ ] No horizontal scroll
- [ ] Touch gestures work

### PWA Features
- [ ] Add to home screen prompt
- [ ] App icon displays
- [ ] Splash screen shows
- [ ] Offline mode works
- [ ] Service worker caches assets
- [ ] Push notifications (if enabled)

---

## 1️⃣5️⃣ PERFORMANCE 🟡 P1

### Load Times
- [ ] Initial page load < 3 seconds
- [ ] Feed loads < 2 seconds
- [ ] Images lazy load
- [ ] Videos lazy load
- [ ] Infinite scroll smooth
- [ ] No layout shift
- [ ] Smooth animations (60fps)

### Database
- [ ] Queries optimized
- [ ] Indexes working
- [ ] RLS policies enforced
- [ ] No N+1 queries
- [ ] Real-time updates work

---

## 1️⃣6️⃣ SECURITY 🔴 P0

### Authentication
- [ ] JWT tokens secure
- [ ] Session timeout works
- [ ] CSRF protection
- [ ] XSS prevention
- [ ] SQL injection prevention
- [ ] Rate limiting works

### Data Protection
- [ ] RLS policies enforced
- [ ] Users can't edit others' data
- [ ] Sensitive data encrypted
- [ ] API keys not exposed
- [ ] HTTPS enforced

---

## 1️⃣7️⃣ EDGE CASES 🟢 P2

### Error Handling
- [ ] Network error messages
- [ ] 404 page displays
- [ ] 500 error handled
- [ ] Invalid input validation
- [ ] Empty states display
- [ ] Loading states display
- [ ] Retry mechanisms work

### Edge Cases
- [ ] Very long usernames
- [ ] Very long captions
- [ ] Special characters in text
- [ ] Emoji support
- [ ] Multiple rapid clicks
- [ ] Slow network simulation
- [ ] Offline behavior
- [ ] Browser back button

---

## 1️⃣8️⃣ QUEBEC-SPECIFIC FEATURES 🟢 P2

### Language & Culture
- [ ] French/joual support
- [ ] Quebec regions accurate
- [ ] Local hashtags work
- [ ] Cultural references correct
- [ ] Ti-Guy personality authentic
- [ ] Quebec holidays recognized

### Hyper-local
- [ ] Geolocation works
- [ ] Nearby posts display
- [ ] Regional filters work
- [ ] Quebec events integration
- [ ] Local business features

---

## 1️⃣9️⃣ STRIPE INTEGRATION 🔴 P0

### Payment Processing
- [ ] Stripe checkout opens
- [ ] Test card works (4242...)
- [ ] Payment succeeds
- [ ] Subscription activated
- [ ] Order created
- [ ] Webhook received
- [ ] Database updated
- [ ] Receipt sent (if configured)

### Error Handling
- [ ] Declined card handled
- [ ] Expired card handled
- [ ] Insufficient funds handled
- [ ] Network error handled
- [ ] Cancel checkout works

---

## 2️⃣0️⃣ BROWSER COMPATIBILITY 🟡 P1

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Firefox Mobile
- [ ] Samsung Internet

---

## 🎯 TESTING METHODOLOGY

### 1. Manual Testing
- Go through each feature systematically
- Test happy paths
- Test error scenarios
- Test edge cases
- Document bugs with screenshots

### 2. User Flow Testing
- Complete user journeys
- Sign up → Post → Engage → Subscribe
- Creator journey
- Buyer journey

### 3. Performance Testing
- Network throttling (3G simulation)
- Multiple tabs open
- Long sessions
- Memory leaks check

### 4. Security Testing
- Try to access unauthorized data
- Test RLS policies
- Attempt XSS/SQL injection
- Check exposed API keys

---

## 🐛 BUG REPORTING FORMAT

When you find a bug, report it like this:

```
**Bug Title**: [Short description]
**Priority**: P0/P1/P2/P3
**Steps to Reproduce**:
1. Go to...
2. Click on...
3. See error

**Expected**: What should happen
**Actual**: What actually happens
**Browser**: Chrome 120
**Device**: iPhone 14 / Desktop
**Screenshot**: [if applicable]
```

---

## ✅ READY TO TEST!

**Start with P0 (Critical) features first!**

Let me know which area you want to test first, or if you want me to:
1. **Run automated tests** (check for console errors, broken links)
2. **Test specific features** (tell me which ones)
3. **Do a full walkthrough** (I'll test everything systematically)

**LET'S SHIP THIS! 🚀⚜️**

