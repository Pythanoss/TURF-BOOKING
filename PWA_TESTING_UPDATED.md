# PWA Testing Guide - Updated for Chrome 115+

## ⚠️ Important: PWA Category Removed from Lighthouse

As of Chrome 115, Google removed the standalone "Progressive Web App" category from Lighthouse. PWA checks are now integrated into "Best Practices" and the Application tab.

---

## ✅ Method 1: Using Application Tab (Best Way)

### Step 1: Open DevTools Application Tab

1. Open your app in Chrome: `http://localhost:5174`
2. Press **F12** to open DevTools
3. Click the **"Application"** tab at the top

### Step 2: Check Manifest

1. In left sidebar, click **"Manifest"** under "Application"
2. You should see:
   - ✅ **Identity**: Name = "Turf Booking"
   - ✅ **Presentation**: Display = "standalone"
   - ✅ **Icons**: List of app icons
   - ✅ **Protocol handlers**: (empty is fine)

3. **Look for warnings** at the top:
   - If you see "⚠️ No manifest detected" → manifest.json not loaded
   - If you see icon warnings → icons missing from `/public` folder

### Step 3: Check Service Worker

1. In left sidebar, click **"Service workers"** under "Application"
2. You should see:
   - ✅ Service worker status: **"activated and is running"** (green circle)
   - ✅ Source URL showing
   - ✅ Status: "running"

3. **Test Update**:
   - Check "Update on reload" checkbox
   - Reload page to test updates

### Step 4: Check Installability

1. Still in "Application" tab, look at the **top section**
2. You should see one of these:
   - ✅ **"This page is installable"** (green checkmark)
   - ⚠️ **"Page is not installable. See warnings."** (warnings listed below)

3. **Common Install Blockers**:
   - ❌ No service worker registered
   - ❌ Manifest missing or invalid
   - ❌ Icons missing or wrong size
   - ❌ Not served over HTTPS (localhost is exempt)
   - ❌ No start_url in manifest

### Step 5: Test Storage

1. In left sidebar, expand **"Storage"**
2. Check **"Local Storage"** → `http://localhost:5174`
3. You should see:
   - `turfBookingUser` (if logged in)
   - `installPromptDismissed` (if prompt was dismissed)

### Step 6: Check Cache Storage

1. In left sidebar, expand **"Cache Storage"**
2. After service worker activates, you should see:
   - Workbox runtime cache
   - Cached assets (HTML, CSS, JS files)

---

## ✅ Method 2: Using Lighthouse Best Practices

### Step 1: Run Lighthouse

1. Open **"Lighthouse"** tab in DevTools
2. Make sure **"Best practices"** is checked
3. Select **"Desktop"** or **"Mobile"**
4. Click **"Analyze page load"**

### Step 2: Check PWA-Related Issues

Scroll through the **"Best Practices"** report and look for:
- ✅ Uses HTTPS
- ✅ Has a viewport meta tag
- ✅ Provides a valid Apple touch icon
- ✅ Configured for a custom splash screen

These are the PWA checks that were moved from the old PWA category.

---

## ✅ Method 3: Manual Installation Test

### Desktop Installation Test

1. **Visit your app**: `http://localhost:5174`

2. **Look for install button**:
   - Chrome: Look for **⊕ Install icon** in address bar (right side)
   - Edge: Look for **app available icon** in address bar
   - Or your custom install prompt should appear at the bottom

3. **Click to install**:
   - Dialog appears: "Install Turf Booking?"
   - Shows app icon and name
   - Click "Install"

4. **Verify installed app**:
   - App opens in new window without browser UI
   - Check if app appears in:
     - Windows: Start Menu / Desktop
     - Mac: Applications folder / Dock
     - Linux: App menu

5. **Test installed app**:
   - Navigate through pages
   - Login and logout
   - Book a slot
   - Check if bottom nav works
   - Close and reopen app

### Mobile Installation Test (Android)

1. **Open Chrome** on Android phone
2. **Visit**: `http://YOUR_IP:5174` (replace with your computer's IP)
3. **Look for banner**: Install prompt should appear at bottom
4. **Or tap menu** (⋮) → "Install app" or "Add to Home screen"
5. **Verify installation**:
   - App icon on home screen
   - Opens fullscreen (no browser UI)
   - Status bar color is green (#10b981)
   - Bottom nav is visible

### Mobile Installation Test (iOS)

1. **Open Safari** on iPhone/iPad
2. **Visit**: `http://YOUR_IP:5174`
3. **Tap Share button** (⎙) at bottom
4. **Scroll and tap**: "Add to Home Screen"
5. **Edit name** if needed, tap "Add"
6. **Verify installation**:
   - App icon on home screen
   - Opens without Safari UI
   - Acts like native app

---

## ✅ Method 4: Using Chrome's PWA Install Criteria

### Check Install Criteria

1. Open DevTools
2. Press **Cmd/Ctrl + Shift + P** to open command palette
3. Type: "Show Install"
4. Select: **"Show Install Promotion"**
5. This will show you if the app meets PWA criteria

### Install Requirements Checklist

Your app must have:
- ✅ Web app manifest (manifest.json)
- ✅ Service worker with fetch event handler
- ✅ Served over HTTPS (or localhost for testing)
- ✅ At least one icon (192x192 or larger)
- ✅ `start_url` in manifest
- ✅ `name` or `short_name` in manifest
- ✅ `display` must be one of: fullscreen, standalone, minimal-ui
- ✅ Prefer_related_applications is false or not present

---

## 🔍 Troubleshooting: Why PWA Is Not Installable

### Check Console for Errors

1. Open **Console** tab in DevTools
2. Look for errors related to:
   - Manifest parsing errors
   - Service worker registration errors
   - Icon loading errors

### Common Issues and Fixes

#### Issue 1: No Install Button Appears

**Diagnosis:**
- Open Application tab → Manifest section
- Look for warnings at the top

**Fixes:**
```bash
# 1. Make sure service worker is registered
# Check Application → Service Workers

# 2. Ensure manifest is loaded
# Check Application → Manifest

# 3. Create icon files (CRITICAL!)
# You need actual PNG files, not placeholders
```

**Quick Fix - Create Icons:**
```bash
# Install sharp-cli for image generation
npm install -g sharp-cli

# Or use online tool:
# Visit: https://www.pwabuilder.com/imageGenerator
# Upload a 512x512 image
# Download generated icons
# Place in /public folder
```

#### Issue 2: Service Worker Not Registering

**Check:**
1. Open Application → Service Workers
2. If empty or error shown

**Fix:**
```bash
# 1. Clear cache and hard reload
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)

# 2. Unregister old service workers
# Application → Service Workers → Unregister

# 3. Rebuild the app
npm run build
npm run preview
```

#### Issue 3: Manifest Not Loading

**Check:**
1. Application → Manifest section
2. If showing "No manifest detected"

**Fix:**
```bash
# Verify manifest.json exists in public folder
ls -la public/manifest.json

# Check if vite.config.js has correct config
# The VitePWA plugin should generate it automatically
```

#### Issue 4: Icons Missing

**Error Message:**
```
⚠️ Manifest: property 'icons' has no valid icon
```

**Fix:**
You MUST create actual icon files:

**Option A - Use Placeholder for Testing:**
```bash
# Create a simple colored square
cd public

# On Mac/Linux with ImageMagick:
convert -size 512x512 xc:#10b981 \
  -gravity center \
  -pointsize 200 \
  -fill white \
  -annotate +0+0 "TB" \
  pwa-512x512.png

convert pwa-512x512.png -resize 192x192 pwa-192x192.png

# On Windows, download from:
# https://via.placeholder.com/512/10b981/FFFFFF?text=TB
# Save as pwa-512x512.png
```

**Option B - Use Online Generator (Recommended):**
1. Visit https://www.pwabuilder.com/imageGenerator
2. Upload any image (logo, photo, etc.)
3. Click "Generate"
4. Download ZIP file
5. Extract and copy `pwa-192x192.png` and `pwa-512x512.png` to `/public`

**Option C - Use Canva (Professional):**
1. Go to https://www.canva.com
2. Create 512x512px design
3. Design: Green circle background, white "TB" text
4. Download as PNG
5. Use online resizer for 192x192 version
6. Place both in `/public` folder

---

## ✅ Verification Checklist

Run through this checklist to ensure your PWA is working:

### Development Environment (localhost)

- [ ] App runs without errors: `npm run dev`
- [ ] Console has no errors (F12 → Console)
- [ ] Manifest loads correctly (Application → Manifest)
- [ ] Service worker registers (Application → Service Workers - green dot)
- [ ] Icons exist in `/public` folder (192x192 and 512x512)
- [ ] Install button appears in address bar (after a few seconds)
- [ ] Custom install prompt shows (at bottom of page)
- [ ] Can install app from browser
- [ ] Installed app opens in standalone window
- [ ] App works after installation
- [ ] Bottom navigation works in installed app
- [ ] Can login/logout in installed app
- [ ] LocalStorage persists data

### Production Environment (Vercel)

- [ ] App deployed to Vercel successfully
- [ ] HTTPS enabled automatically (Vercel provides this)
- [ ] Visit deployed URL in Chrome
- [ ] Manifest loads (check Application tab)
- [ ] Service worker registers (check Application tab)
- [ ] Install button appears in address bar
- [ ] Can install from mobile device (Android/iOS)
- [ ] App icon appears on home screen
- [ ] App opens fullscreen (no browser UI)
- [ ] Status bar color is green on Android
- [ ] App works offline after first visit
- [ ] Can share app URL with others

### Lighthouse Best Practices Check

- [ ] Run Lighthouse with "Best practices" checked
- [ ] Score is 90% or higher
- [ ] No PWA-related warnings
- [ ] Uses HTTPS (in production)
- [ ] Has valid viewport meta tag
- [ ] Provides Apple touch icon

---

## 📱 Testing on Real Devices

### Before Client Demo

1. **Deploy to Vercel first** (localhost won't work on phone)
   ```bash
   # Quick deploy
   vercel --prod
   ```

2. **Test on Android** (Most important - best PWA support)
   - Use real Android device, not emulator
   - Open Chrome (not other browsers)
   - Visit Vercel URL
   - Install from banner or menu
   - Test all features
   - Turn on airplane mode and test offline

3. **Test on iOS** (Important for iPhone users)
   - Use real iOS device
   - Open Safari (not Chrome!)
   - Visit Vercel URL
   - Share → Add to Home Screen
   - Test all features
   - Note: Limited offline support on iOS

4. **Test on Desktop** (Nice to have)
   - Chrome or Edge
   - Install from address bar
   - Test as desktop app

---

## 🎯 PWA Features Summary

### What's Working in Your App

✅ **Manifest Configuration**
- App name: "Turf Booking"
- Theme color: Green (#10b981)
- Display: Standalone (fullscreen)
- Start URL: /
- Icons: 192x192, 512x512 (need to create files)

✅ **Service Worker**
- Auto-generated by Vite PWA plugin
- Caches all static assets
- Offline support enabled
- Auto-updates on new deployment

✅ **Install Prompt**
- Custom component (InstallPrompt.jsx)
- Shows on first visit
- Can be dismissed
- Remembers user choice

✅ **App-like Experience**
- No browser UI when installed
- Bottom navigation like native apps
- Smooth transitions
- Loading states
- Responsive design

✅ **Offline Support**
- Cached assets served when offline
- Pages work without internet
- User data persists (localStorage)

### What Needs Backend Integration

⚠️ **Push Notifications** (requires backend)
⚠️ **Background Sync** (requires backend)
⚠️ **Real Authentication** (currently mock)
⚠️ **Real Payment Processing** (currently mock)

---

## 🔧 Quick Debug Commands

```bash
# Check if service worker file exists
ls -la dist/sw.js

# Check if manifest exists
ls -la public/manifest.json

# Check if icons exist
ls -la public/pwa-*.png

# Build and preview production version
npm run build
npm run preview

# Clear all app data (in DevTools Console)
localStorage.clear()
navigator.serviceWorker.getRegistrations().then(r => r.forEach(r => r.unregister()))
caches.keys().then(c => c.forEach(c => caches.delete(c)))

# Then reload page (Ctrl+Shift+R)
```

---

## 📞 Still Having Issues?

### Check These Files Exist

```bash
# Required files for PWA
public/manifest.json          ✓ (created)
public/pwa-192x192.png       ⚠️ (YOU NEED TO CREATE)
public/pwa-512x512.png       ⚠️ (YOU NEED TO CREATE)
vite.config.js               ✓ (configured)
src/components/InstallPrompt.jsx  ✓ (created)
```

### Most Common Issue: Missing Icons

**The #1 reason PWA doesn't install is missing icon files.**

**Quick Fix:**
1. Download any image from the internet
2. Use this online tool: https://realfavicongenerator.net/
3. Upload your image
4. Download generated icons
5. Place `pwa-192x192.png` and `pwa-512x512.png` in `/public`
6. Hard reload: Ctrl+Shift+R
7. Install button should appear!

---

## ✅ Success Criteria

Your PWA is working correctly when:

1. ✅ Install button appears in Chrome address bar
2. ✅ Custom install prompt shows at bottom of page
3. ✅ Can install and launch app
4. ✅ App opens without browser UI
5. ✅ All pages work in installed app
6. ✅ Works offline after first visit
7. ✅ On mobile: Status bar color is green
8. ✅ On mobile: App icon on home screen
9. ✅ Lighthouse Best Practices score > 90%

---

## 🚀 Next Steps

Once PWA is working locally:

1. **Create proper icons** (professional logo)
2. **Deploy to Vercel**: `vercel --prod`
3. **Test on real devices** (Android + iOS)
4. **Run Lighthouse audit** on production URL
5. **Demo to client** with installed app
6. **Add to Google Play Store** (via TWA) - optional
7. **Submit to iOS App Store** (via wrapper) - optional

---

**Remember**: The PWA category is gone from Lighthouse, but your app is still a PWA! Use the Application tab to verify everything works correctly.

Need help? The Application tab tells you exactly what's wrong! 🎯
