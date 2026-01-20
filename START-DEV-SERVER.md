# How to Start the Dev Server

## Quick Start

```bash
cd frontend
npm run dev
```

The server will start on **http://localhost:3001**

## Step-by-Step Instructions

### 1. Navigate to Frontend Directory
```bash
cd "/Users/dillonwallace/Desktop/Garage Built Digital LLC/Websites Testing/gokartpartpicker.com/frontend"
```

### 2. Check if Server is Already Running
```bash
# Check if port 3001 is in use
lsof -ti:3001
```

If you see a process ID, the server is already running. If not, continue to step 3.

### 3. Start the Dev Server
```bash
npm run dev
```

You should see output like:
```
▲ Next.js 16.1.2
- Local:        http://localhost:3001
- Environments: .env.local

✓ Ready in 2.5s
```

### 4. Open in Browser
Once you see "Ready", open:
- **http://localhost:3001**

## Troubleshooting

### Issue: "Port 3001 is already in use"
**Solution:**
```bash
# Kill the process using port 3001
lsof -ti:3001 | xargs kill -9

# Then start the server again
npm run dev
```

### Issue: "Cannot find module" or "Missing dependencies"
**Solution:**
```bash
cd frontend
npm install
npm run dev
```

### Issue: "EADDRINUSE: address already in use"
**Solution:**
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9

# Or use a different port
PORT=3002 npm run dev
```

### Issue: Server starts but page won't load
**Check:**
1. Is the server actually running? Look for "Ready" message
2. Check browser console for errors (F12)
3. Try a different browser
4. Check if firewall is blocking localhost

### Issue: "Safari Can't Connect to the Server"
**This means:**
- Server is not running, OR
- Server is running on a different port, OR
- There's a network/firewall issue

**Solution:**
1. Verify server is running:
   ```bash
   lsof -ti:3001
   ```
2. If no output, start the server:
   ```bash
   cd frontend
   npm run dev
   ```
3. Wait for "Ready" message
4. Try http://localhost:3001 again

## Verify Server is Running

### Method 1: Check Terminal Output
Look for:
```
✓ Ready in X.Xs
▲ Next.js 16.1.2
- Local:        http://localhost:3001
```

### Method 2: Check Port
```bash
lsof -ti:3001
```
If you see a number, the server is running.

### Method 3: Test Connection
```bash
curl http://localhost:3001
```
If you get HTML back, the server is working.

## Common Mistakes

1. **Running from wrong directory**
   - Must be in `frontend/` directory
   - Check: `pwd` should show `.../frontend`

2. **Not waiting for "Ready" message**
   - Server takes a few seconds to start
   - Wait for "Ready" before opening browser

3. **Using wrong port**
   - Server is on **3001**, not 3000
   - URL: http://localhost:3001

4. **Multiple servers running**
   - Check for other Next.js processes
   - Kill all and restart fresh

## Quick Commands

```bash
# Start server
cd frontend && npm run dev

# Stop server
Ctrl+C (in terminal running server)

# Kill server on port 3001
lsof -ti:3001 | xargs kill -9

# Check if running
lsof -ti:3001

# Test connection
curl http://localhost:3001
```

---

*Last Updated: 2026-01-17*
