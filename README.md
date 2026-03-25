# TeraLead Scraper

Extract business leads from Google Maps — names, phones, emails, websites, and more — all from your browser.

---

## 📥 How to Download

1. Go to the **[Releases Page](https://github.com/M-Taqi796/teralead-scraper/releases)**
2. Find the latest release (e.g. **v1.0.0**)
3. Click on **`teralead-scraper-v1.0.zip`** to download it
4. Unzip the downloaded file — you'll get a folder called `dist`

---

## 🧩 How to Install in Chrome

1. Open **Google Chrome**
2. Type `chrome://extensions` in the address bar and press **Enter**
3. Turn on **Developer mode** using the toggle in the top-right corner
4. Click the **"Load unpacked"** button (top-left)
5. Select the **`dist`** folder you unzipped earlier
6. You'll see the **TeraLead** icon appear in your Chrome toolbar — you're ready to go!

> **Tip:** If you don't see the icon, click the 🧩 puzzle piece icon in the toolbar and pin **TeraLead**.

---

## 🚀 How to Use

### Step 1 — Open Google Maps

Go to [Google Maps](https://www.google.com/maps) and search for what you need, for example:

- `Roofing companies in Toronto`
- `Restaurants in New York`
- `Dentists near me`

Wait for the results list to appear on the left side.

### Step 2 — Configure Your Scrape

Click the **TeraLead icon** in your toolbar to open the extension popup.

| Setting | What it does |
|---|---|
| **Max Rows** | How many businesses to collect (default: 200) |
| **Infinite Scroll** | Ignore the max limit and keep going until Maps runs out |
| **Export Columns** | Choose which data fields you want (name, email, phone, etc.) |
| **Deep Email Enrichment** | Visits each business website to find hidden email addresses |
| **Strict Scrape Mode** | Skips businesses that are missing any of your selected fields |

### Step 3 — Start Scraping

Click the **▶ Start Scrape** button. You'll see real-time stats:

- **Scraped** — How many listings were processed
- **Visited** — How many websites were checked for emails
- **Emails** — How many email addresses were found

A progress bar will show the current activity.

### Step 4 — View & Export Results

Click **Results Tracker** to open the full data table in a new tab.

From there you can:
- Browse all your collected data
- Click any email to **copy it** to your clipboard
- Click **Download CSV** to export everything as a spreadsheet file

> The CSV file opens in **Excel**, **Google Sheets**, or any spreadsheet app.

### Step 5 — Start Fresh

Click **New Scrape** in the top-right of the popup to clear all previous data and settings, then run a new search.

---

## 💡 Tips

- **Don't close the Google Maps tab** while scraping is active
- The extension works only on `google.com/maps` — it won't activate on other websites
- For best results, zoom into a specific city or area before searching
- If scraping stops unexpectedly, click **Stop All**, then try again

---

## 🛠 For Developers

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Build + zip for release
npm run release
```

The built extension goes into the `dist/` folder.