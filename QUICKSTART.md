# 🚀 TeraLead - Installation & First Run

## ⚡ Super Quick Start (2 minutes)

### 1️⃣ Build the Extension
```bash
cd /Users/muhammadtaqi/workspace/Scrapper/teralead-scraper
npm run build
```
✅ This creates the `dist/` folder with your extension.

### 2️⃣ Load in Chrome
1. Open `chrome://extensions/`
2. Turn ON **"Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"** button
4. Select the **`dist`** folder from this project
5. ✅ Extension is now loaded!

### 3️⃣ Test It
1. Go to: **https://www.google.com/maps**
2. Search for something (e.g., **"plumbers near me"**)
3. Click the **TeraLead icon** in Chrome's extension bar (top-right)
4. Enter **Target: 10** and click **"Start Scraping"**
5. Watch the dashboard update in real-time
6. Click **"Download CSV"** when done

---

## 📋 Checklist for First Run

Before you start, verify:

- [ ] Node.js is installed (`node --version` should show v18+)
- [ ] npm dependencies installed (`npm install` was run)
- [ ] Build succeeded without errors (`npm run build`)
- [ ] Chrome extension folder (`dist/`) exists
- [ ] Chrome is version 88+
- [ ] You have Google Maps search results open

---

## 🎯 What to Expect

### Dashboard Stats (Real-Time)
- **Rows Scraped**: Should increment as businesses are found
- **Websites Visited**: Should increase during enrichment phase
- **Emails Found**: Should grow as emails are extracted

### Timeline
- **Scraping**: 5-15 seconds (depending on target count)
- **Enrichment**: 30+ seconds (2.5-second delays per website)
- **Total**: Usually 1-3 minutes for 50 businesses

---

## ⚙️ Configuration Options

### Target Row Count
- **Small**: 5-10 (quick testing, 10-30 seconds)
- **Medium**: 25-50 (good data sample, 1-2 minutes)
- **Large**: 100+ (comprehensive, 3-5+ minutes)

### Column Selection
Check which data you want:
- ✅ **Name** - Business name (always useful)
- ✅ **Website** - Home page URL
- ✅ **Email** - Primary business email
- ✅ **Phone** - Contact number
- ✅ **Address** - Physical location
- ✅ **Rating** - Google Maps rating
- ✅ **Reviews** - Number of reviews
- ✅ **Category** - Business type

---

## 📊 CSV Output

Your downloaded file will look like:

```csv
NAME,WEBSITE,EMAIL,PHONE,RATING,REVIEWS,ADDRESS,CATEGORY
Joe's Plumbing,https://joesplumbing.com,info@joesplumbing.com,(555) 123-4567,4.8,156,123 Main St,Plumber
Mary's Cleaning Service,https://maryscleaning.com,contact@maryscleaning.com,(555) 234-5678,4.6,89,456 Oak Ave,Cleaning
```

---

## 🆘 If Something Goes Wrong

### Extension doesn't appear
```bash
# Reload the extension
1. Go to chrome://extensions/
2. Find "TeraLead" 
3. Click the refresh icon
```

### Getting "Could not find Google Maps"
- Make sure you're on a Google Maps page
- Try a new search
- Ensure map has visible results

### No emails found
- Check the websites manually (some don't list emails)
- Try specific searches for "contact pages" only
- Emails might be behind JavaScript (limitation of current version)

### Need to rebuild
```bash
npm run build   # Rebuilds the extension
# Then refresh in chrome://extensions/
```

---

## 💡 Tips & Tricks

### For Best Results
1. **Use specific searches**: "Dentists in Austin" finds better results than "dentist"
2. **Smaller batches**: 25-50 businesses is ideal (not too slow, good data)
3. **Popular niches**: Restaurants, services, local businesses work best
4. **Check timing**: Run during off-hours to avoid rate-limiting

### To Combine Multiple Searches
1. First search: "Coffee shops in NYC" → Start scraping → Download CSV
2. Rename file: `coffee_shops.csv`
3. New search: "Bakeries in NYC" → Start scraping → Download CSV
4. Rename file: `bakeries.csv`
5. Combine in Excel/Sheets manually

### To Speed Up Testing
- Use target count of 5-10 for development
- Results will be ready in 30-45 seconds
- Once happy, run larger batches (50+)

---

## 🔄 Next Runs

### After First Launch
The extension remembers your last configuration:
1. Open popup
2. Previous settings are loaded
3. Just click "Start Scraping"

### To Reset Configuration
```javascript
// In Chrome DevTools (on any page):
chrome.storage.local.clear(() => console.log('Cleared'));
// Then refresh the popup
```

---

## 📖 Full Documentation

Once you're comfortable with the basics, read:
- **[EXTENSION_README.md](EXTENSION_README.md)** - All features explained
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Technical details & debugging

---

## ✨ You're Ready!

Your extension should be working. If you see:
- ✅ TeraLead popup opens
- ✅ Settings inputs respond
- ✅ Dashboard displays
- ✅ Scraping starts when you click the button

Then you're all set! Start scraping! 🎉

---

### Need Help?
1. Check [DEVELOPMENT.md](DEVELOPMENT.md) troubleshooting section
2. Review the error messages in Chrome DevTools
3. Check service worker logs in `chrome://extensions/`

---

**Happy scraping!** 🚀

Version 1.0.0 | March 2026
