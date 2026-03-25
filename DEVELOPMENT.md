# TeraLead Development & Testing Guide

## 📦 Prerequisites

- Node.js 18+ and npm/yarn
- Chrome/Chromium browser (version 88+)
- Basic understanding of Chrome Extensions MV3

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

This installs:
- React 19 & React DOM
- TypeScript
- Vite & plugins (@vitejs/plugin-react, @crxjs/vite-plugin)
- Tailwind CSS
- ESLint for code quality

### 2. Build the Extension

```bash
npm run build
```

**Output**: `dist/` folder containing the built extension

**What gets built**:
- `background/service-worker.js` - The background service worker
- `content/content.js` - Content script for Google Maps
- `popup/popup.html` & `popup/popup.js` - Popup UI and scripts
- `manifest.json` - Extension manifest file
- All necessary asset files

### 3. Development Mode

```bash
npm run dev
```

Starts Vite in watch mode. Changes are auto-compiled, but you need to reload the extension in Chrome to see them.

## 🚀 Loading the Extension in Chrome

### Manual Loading (Development)

1. **Open Extensions Page**
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode**
   - Toggle "Developer mode" switch (top-right corner)

3. **Load Unpacked**
   - Click "Load unpacked"
   - Navigate to your project's `dist/` folder
   - Click "Select Folder"

4. **Grant Permissions**
   - Chrome will ask for permissions
   - Click "Allow" to grant required permissions

### After Making Changes

- **Just Files**: Simple edits (CSS, text) → Just reload the extension in Chrome (`ctrl+R`)
- **TypeScript/Manifest**: Changes to code or manifest → Run `npm run build` → Reload extension

## 🧪 Testing Workflow

### 1. Test Content Script (Google Maps Scraping)

**Setup**:
1. Go to https://www.google.com/maps/search/restaurants+in+new+york
2. Open extension popup
3. Click "Start Scraping"

**What to verify**:
- ✅ Popup shows "Scraping started..."
- ✅ Dashboard stats start updating
- ✅ Content script is scrolling through results
- ✅ Rows are being collected

**Debugging**:
```javascript
// In Chrome DevTools Console (on Maps page):
// Check for content script messages
chrome.runtime.onMessage.addListener((msg) => console.log('Popup ->Content:', msg));
```

### 2. Test Background Service Worker (Email Enrichment)

**Setup**:
1. Start scraping (see above)
2. Wait for results to be processed

**What to verify**:
- ✅ Dashboard shows "Websites Visited" increasing
- ✅ Dashboard shows "Emails Found" increasing
- ✅ Some businesses get email addresses populated

**Debugging**:
```javascript
// View service worker logs
// Go to chrome://extensions/ → TeraLead → "Service Worker"
// This shows console.log output from the background worker

// Or check results in storage:
chrome.storage.local.get(null, (items) => console.table(items));
```

### 3. Test Popup UI

**Features to test**:
- [ ] Input field updates target row count
- [ ] Checkboxes toggle column selection
- [ ] Start/Stop buttons enable/disable appropriately
- [ ] Stats update in real-time
- [ ] Download CSV button works
- [ ] Status messages appear and disappear
- [ ] Dark mode looks good

**Test Cases**:
```
Test 1: Normal Flow
- Enter target count: 25
- Select all columns
- Click "Start Scraping"
- Wait 2-3 minutes
- Click "Download CSV"
- Verify CSV has 25 rows with all columns

Test 2: Partial Columns
- Toggle off some columns (e.g., uncheck "Reviews")
- Start scraping
- Download CSV
- Verify CSV doesn't have review column

Test 3: Stop Scraping
- Start scraping
- Wait 10-15 seconds
- Click "Stop Scraping"
- Verify scraping stops
- Verify data to that point is still accessible

Test 4: Multiple Scrapings
- Do one scrape with 10 results
- Download CSV
- Do another scrape with 15 results
- Download CSV again
- Note: Results should continue from previous scrape
```

### 4. Test CSV Export

**Manually test**:
```javascript
// In popup console:
chrome.storage.local.get('teralead_results', (data) => {
  console.table(data.teralead_results); // See all collected data
});
```

**Expected CSV format**:
```csv
NAME,PHONE,WEBSITE,EMAIL,ADDRESS,RATING,REVIEWS,CATEGORY
Restaurant A,555-123-4567,https://restauranta.com,info@restauranta.com,123 Main St,4.5,234,Restaurant
Restaurant B,555-234-5678,https://restaurantb.com,contact@restaurantb.com,456 Oak Ave,4.2,156,Restaurant
```

## 🐛 Debugging

### Chrome DevTools

**For Content Script (Google Maps page)**:
- Open DevTools (F12) on Google Maps page
- Console tab shows `[TeraLead]` logs
- Check "Pause on exceptions" to catch errors

**For Service Worker**:
- Go to `chrome://extensions/`
- Find TeraLead extension
- Click "Service Worker" link
- Opens DevTools for background worker

**For Popup**:
- Right-click popup → "Inspect"
- Shows popup-specific console and DOM

### Storage Inspection

```javascript
// View all stored data
chrome.storage.local.get(null, (data) => {
  console.log('All Storage:', data);
});

// Check specific key
chrome.storage.local.get('teralead_results', (data) => {
  console.log('Results:', data);
});

// Clear storage (reset extension)
chrome.storage.local.clear(() => {
  console.log('Storage cleared');
});
```

### Network Issues

**If websites aren't being fetched**:

1. Check service worker console for CORS errors
2. Some websites may refuse requests without proper User-Agent
3. Try increasing delay: Edit `service-worker.ts` line where `const DELAY_BETWEEN_REQUESTS = 2500`

**If Google Maps selection isn't working**:

1. Selectors may have changed - inspect Google Maps DOM
2. Check content script console for parsing errors
3. Update selectors in `parseBusinessElement()` function

## 📊 Monitoring

### Real-time Stats

The popup dashboard updates every 1 second during scraping:
- **Rows Scraped**: Total businesses collected
- **Websites Visited**: How many websites were fetched for enrichment
- **Emails Found**: How many email addresses were discovered

### Data Persistence

All data is stored in `chrome.storage.local`:
- Persists even if popup is closed
- Persists across browser sessions
- Survives extension reload
- Can be cleared via "Clear Data" button (if implemented) or manually via DevTools

## 🔧 Common Issues & Solutions

### Issue: "Could not find Google Maps results list"
**Solution**: 
- Ensure you're on a Google Maps search page with results
- Try a new search
- Google Maps might have changed their DOM - update selectors in `content.ts`

### Issue: No emails being found
**Solution**:
- Many websites have emails in JavaScript-rendered content (not in HTML source)
- Current implementation uses regex on HTML source only
- Try sites with emails visible in source: contact pages, footers
- Increase crawl attempts in `service-worker.ts`

### Issue: Service worker console not showing
**Solution**:
- Go to `chrome://extensions/`
- Find the extension
- Click "Service Worker" - wait a moment for logs to appear
- Service workers may go inactive if no messages received

### Issue: Changes not applying
**Solution**:
- Run `npm run build` after code changes
- Manually reload extension in Chrome (or use refresh icon next to extension name)
- For manifest.json changes, must reload unpacked extension

## 🚀 Performance Tips

1. **Reduce target count** for faster testing (e.g., 5 or 10 instead of 100)
2. **Increase scroll delay** if Google Maps is rate-limiting: Edit `content.ts` line ~150
3. **Increase website fetch delay** if having issues: Edit `service-worker.ts` line ~12
4. **Use specific search queries** to get better results

## 📚 Code Quality

### Linting

```bash
npm run lint
```

Checks for TypeScript and ESLint errors.

### Build Check

```bash
npm run build
```

Verifies extension builds without errors.

## 🔐 Security Considerations

1. **CORS**: Extension can fetch from any domain (host_permissions allows it)
2. **Storage**: All data is local to the browser's profile
3. **Content Script**: Only runs on Google Maps domain
4. **Service Worker**: No external data collection or telemetry
5. **Email Extraction**: Local regex processing, no external email validation API

## 📈 Testing Checklist

- [ ] Extension loads without errors
- [ ] Popup opens and closes correctly
- [ ] Config settings save and load
- [ ] Content script runs on Google Maps
- [ ] Results are extracted correctly
- [ ] Background worker enriches with emails
- [ ] Stats update in real-time
- [ ] CSV downloads with correct data
- [ ] Extension can be reloaded without issues
- [ ] Storage persists across reloads
- [ ] No console errors in any component

## 🎯 Next Steps

After successfully building and testing:

1. Test on different Google Maps queries
2. Test with different target counts (1, 10, 100, 1000)
3. Monitor service worker logs for patterns/errors
4. Verify CSV data quality
5. Consider edge cases (no website, no email, etc.)

## 📞 Getting Help

If you encounter issues:

1. Check service worker console (`chrome://extensions/` → Service Worker)
2. Check content script console (on Google Maps page)
3. Check popup console (right-click popup → Inspect)
4. Look for `[TeraLead]` log messages with details
5. Review the main README for architectural details

---

Happy Testing! 🎉
