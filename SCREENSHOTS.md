# PWA Screenshots Guide

This guide will help you create screenshots for the PWA install prompt.

## Required Screenshots

The manifest is configured for **3 screenshots** (portrait mode for mobile):
- Screenshot 1: Main recording interface
- Screenshot 2: Hands-free voice commands in action
- Screenshot 3: Saved memos list

## How to Create Screenshots

### Option 1: Using Browser DevTools (Recommended)

1. **Open your app** in Chrome/Edge
2. **Open DevTools** (F12 or Right-click → Inspect)
3. **Toggle Device Toolbar** (Ctrl+Shift+M or click the phone/tablet icon)
4. **Set device** to "iPhone 14 Pro" or custom dimensions: **390x844**
5. **Set zoom** to 100%

### Screenshot 1: Main Recording Interface
- Make sure you're on the main page
- Show the transcription textarea
- Show the microphone button
- Take screenshot (use browser screenshot tool or DevTools)
- Save as `public/screenshots/screenshot-1.png`

### Screenshot 2: Hands-Free Voice Commands
- Click the "Hands-Free" button to activate it
- Optionally trigger a voice command to show the feedback toast
- Capture the screen showing the hands-free mode active
- Save as `public/screenshots/screenshot-2.png`

### Screenshot 3: Saved Memos List
- Create 2-3 sample memos
- Scroll to show the saved memos section
- Capture the memos list
- Save as `public/screenshots/screenshot-3.png`

### Option 2: Using Screenshot Tools

1. Set your browser window to mobile dimensions (390px width)
2. Use a screenshot tool like:
   - **Windows**: Snipping Tool or Win+Shift+S
   - **Mac**: Cmd+Shift+4
   - **Linux**: gnome-screenshot or Spectacle

3. Crop to exactly **390x844** pixels (or 1170x2532 for @3x retina)

## Resize and Optimize

After taking screenshots, resize them to **1170x2532** (retina resolution):

```bash
# Using ImageMagick (if installed)
convert screenshot-1.png -resize 1170x2532! public/screenshots/screenshot-1.png
convert screenshot-2.png -resize 1170x2532! public/screenshots/screenshot-2.png
convert screenshot-3.png -resize 1170x2532! public/screenshots/screenshot-3.png
```

Or use an online tool like:
- https://www.iloveimg.com/resize-image
- https://imageresizer.com/

## Quick Test Script

Here's a quick way to create placeholder screenshots using your app:

1. Open your deployed app (or run locally)
2. Open browser console and run:
```javascript
// This will open a new window for easy screenshots
window.open(window.location.href, '_blank', 'width=390,height=844')
```

## Verify

After adding screenshots, verify they appear in the PWA install dialog by:
1. Deploy your changes
2. Open the app in Chrome/Edge
3. Click the install button
4. Screenshots should appear in the install dialog

## Tips

- Use **light mode** for consistency
- Make sure text is readable
- Show the app in its best state
- Include some demo content (sample memos)
- Avoid showing personal information
