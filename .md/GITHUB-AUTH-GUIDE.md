# GitHub Authentication Guide

## Option 1: Personal Access Token (Recommended)

### Step 1: Create a Personal Access Token

1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `gokartpartpicker-push`
4. Select scopes:
   - ✅ **repo** (Full control of private repositories)
5. Click **"Generate token"**
6. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Push Using Token

Run these commands:

```bash
cd "/Users/dillonwallace/Desktop/Garage Built Digital LLC/Websites Testing/gokartpartpicker.com"

# When prompted for password, paste your token (not your GitHub password)
git push -u origin main
```

**Note:** When it asks for username, enter: `MadeByDW91`  
**Note:** When it asks for password, paste your **token** (not your GitHub password)

---

## Option 2: Use SSH (If you have SSH keys)

### Step 1: Check if you have SSH keys

```bash
ls -la ~/.ssh/id_*.pub
```

If you see files, you have SSH keys. If not, see "Create SSH Key" below.

### Step 2: Add SSH key to GitHub (if not already added)

1. Copy your public key:
   ```bash
   cat ~/.ssh/id_rsa.pub
   # or
   cat ~/.ssh/id_ed25519.pub
   ```

2. Go to GitHub → **Settings** → **SSH and GPG keys** → **New SSH key**
3. Paste your public key
4. Save

### Step 3: Switch to SSH remote

```bash
cd "/Users/dillonwallace/Desktop/Garage Built Digital LLC/Websites Testing/gokartpartpicker.com"

# Remove HTTPS remote
git remote remove origin

# Add SSH remote
git remote add origin git@github.com:MadeByDW91/gokartpartpicker.com.git

# Push
git push -u origin main
```

---

## Option 3: Create SSH Key (If you don't have one)

```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Press Enter to accept default location
# Press Enter for no passphrase (or set one if you want)

# Start SSH agent
eval "$(ssh-agent -s)"

# Add key to agent
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub
```

Then follow **Option 2, Step 2** to add it to GitHub.

---

## Quick Fix: Use GitHub CLI (If installed)

If you have GitHub CLI (`gh`) installed:

```bash
gh auth login
git push -u origin main
```

---

## After Successful Push

Once the push succeeds:

1. ✅ Go to your GitHub repository and verify files are there
2. ✅ Go to Supabase Dashboard → Settings → Integrations → GitHub
3. ✅ The "Branch 'main' not found" error should be gone!
4. ✅ Click "Enable integration" to complete the setup

---

## Troubleshooting

### "Authentication failed"
- Make sure you're using a **token** (not password) for HTTPS
- Or switch to SSH authentication

### "Permission denied"
- Check your token has `repo` scope
- Verify you have access to the repository

### "Repository not found"
- Verify the repository name is correct: `gokartpartpicker.com`
- Check you're logged into the correct GitHub account
