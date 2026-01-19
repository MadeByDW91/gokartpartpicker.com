# Where to Find Root Directory in Vercel

## ✅ Correct Location: Build & Development Settings

The Root Directory setting is **NOT** in General Settings. Here's where it actually is:

### Step-by-Step:

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click on your project: **gokartpartpicker-com**

2. **Click "Settings"** (top navigation bar)

3. **In the LEFT SIDEBAR, click:**
   - **"Build & Development Settings"** (NOT General)

4. **Scroll down to find:**
   - **"Root Directory"** section
   - It should show `/` or be empty
   - Click **"Edit"** button

5. **Change it to:**
   - `frontend`
   - Click **"Save"**

---

## Alternative: Project Settings During Import

If you can't find it in Build & Development Settings, you might need to:

1. Go to **Settings** → **General**
2. Look for **"Project Configuration"** section
3. Or look for a **"Configure Project"** button/link

---

## If Still Can't Find It:

### Option 1: Delete and Re-import Project

1. Go to project → **Settings** → **General**
2. Scroll to bottom → **"Delete Project"**
3. Go to **"Add New Project"**
4. Import from GitHub again
5. **During import setup**, you'll see:
   - **"Root Directory"** field
   - Set it to `frontend` BEFORE clicking Deploy

### Option 2: Use Vercel CLI

If you have Vercel CLI installed:

```bash
cd "/Users/dillonwallace/Desktop/Garage Built Digital LLC/Websites Testing/gokartpartpicker.com"
vercel --prod
```

It will prompt you for settings including root directory.

---

## Visual Guide:

**Settings Page Structure:**
```
Settings
├── General
│   └── (Project name, team, etc.)
├── Build & Development Settings  ← LOOK HERE!
│   ├── Framework Preset
│   ├── Root Directory  ← HERE IT IS!
│   ├── Build Command
│   ├── Output Directory
│   └── Install Command
├── Environment Variables
├── Git
└── ...
```

---

## Quick Check:

**In Build & Development Settings, you should see:**
- Framework Preset: Next.js
- **Root Directory: `/` or empty** ← Change this to `frontend`
- Build Command: (auto-detected)
- Output Directory: (auto-detected)

---

**The key is: It's in "Build & Development Settings", not "General"!** 🔑
