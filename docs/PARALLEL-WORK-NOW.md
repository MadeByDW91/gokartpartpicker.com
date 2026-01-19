# Parallel Work While A3 & A5 Run

> **Things you can do right now that won't conflict**

---

## 🎯 Quick Wins (15-30 min each)

### 1. **Test Existing Builder** ⭐ RECOMMENDED

**What:** The builder UI already exists! Test it to see what works.

**Action:**
1. Go to `http://localhost:3000/builder`
2. Try selecting an engine
3. Try adding parts
4. Check if compatibility warnings show
5. Test save/share functionality

**Report back:** What works? What's broken? What's missing?

**Why:** Helps identify what A3 needs to fix/complete when they finish parts pages.

---

### 2. **Review Compatibility Integration** ⭐ RECOMMENDED

**What:** A6 finished the compatibility engine. Check if it's integrated into builder.

**Action:**
1. Check `frontend/src/app/builder/page.tsx` — Does it use compatibility?
2. Check `frontend/src/hooks/use-compatibility.ts` — Is it working?
3. Check `frontend/src/components/CompatibilityWarning.tsx` — Does it display?

**Report back:** Is compatibility integrated? Any errors?

**Why:** Builder needs compatibility to work properly.

---

### 3. **Check for Missing Server Actions**

**What:** Verify all actions needed for builder exist.

**Quick check:**
- ✅ `createBuild()` — Exists
- ✅ `updateBuild()` — Exists
- ✅ `getBuildByShareId()` — Exists
- ✅ `checkCompatibility()` — Exists
- ⚠️ `getUserBuilds()` — Check if exists

**Action:** Quick grep/search to verify.

---

### 4. **Prepare Builder UI Prompt** (A0 - Me)

**What:** I'll review the existing builder code and prepare an updated prompt for A3.

**Action:** I'll do this automatically - check `NEXT-PROMPT.md` after A3 finishes.

---

### 5. **Test Engine Detail Pages**

**What:** A3 just finished engine detail. Test them!

**Action:**
1. Go to `/engines/predator-212-hemi`
2. Check if specs display
3. Check "Start Build" button
4. Check SEO metadata (view page source)
5. Test 404 (go to `/engines/invalid-slug`)

**Report back:** Any issues?

---

### 6. **Test Parts Admin**

**What:** A5 is seeding parts. Test the admin interface.

**Action:**
1. Go to `/admin/parts`
2. Try creating a part
3. Try editing a part
4. Check if categories work

**Report back:** Any issues?

---

## 📋 Documentation Tasks

### 7. **Update Project Status**

**What:** I'll keep `SIMPLE-STATUS.md` updated automatically.

**Action:** Just check it to see current state.

---

### 8. **Review Error Handling**

**What:** Check if error boundaries exist.

**Action:**
- Check for `error.tsx` files in app directory
- Check for error boundaries in layout
- Test what happens when API calls fail

---

## 🚀 Recommended Order

1. **Test Builder** (15 min) — See what works
2. **Test Engine Detail** (10 min) — Verify A3's work
3. **Check Compatibility Integration** (10 min) — Verify A6's work
4. **Test Parts Admin** (10 min) — Verify A5's work

**Total:** ~45 minutes of testing/verification

---

## 💡 What I'm Doing (A0)

- ✅ Keeping `NEXT-PROMPT.md` updated
- ✅ Tracking progress in `SIMPLE-STATUS.md`
- ✅ Preparing next prompts
- ✅ Ready to coordinate when agents finish

---

*Last Updated: 2026-01-16*
