# TeraLead - Business Data Scraper Chrome Extension

A powerful Chrome Extension (Manifest V3) that scrapes business data from Google Maps and enriches it by automatically finding business email addresses from their websites.

## 🎯 Features

- **Smart Google Maps Scraping**: Automatically scrolls through and extracts business data from Google Maps search results
- **Email Enrichment**: Uses the background service worker to visit business websites and extract email addresses
- **Smart Crawling**: If email isn't found on the homepage, attempts to fetch `/contact` and `/about` pages
- **Real-time Dashboard**: Live tracking of scraped rows, websites visited, and emails found
- **CSV Export**: Download all collected data as a CSV file with customizable columns
- **Rate Limiting**: Built-in 2.5-second delays between website fetches to avoid rate limiting
- **Persistent Storage**: All data stored in Chrome's local storage, survives popup closing

## 🏗️ Project Structure

```
src/
├── background/
│   └── service-worker.ts       # Background service worker for email scraping and enrichment
├── content/
│   └── content.ts              # Content script for Google Maps interaction
├── popup/
│   ├── popup.html              # Popup UI template
│   ├── Popup.tsx               # Main React component for popup
│   └── popup-main.tsx          # Entry point for popup
├── utils/
│   ├── types.ts                # Shared TypeScript interfaces
│   ├── storage.ts              # Chrome storage management
│   ├── email.ts                # Email extraction utilities
│   └── csv.ts                  # CSV generation and download utilities
└── styles/
    └── popup.css               # Popup styling (Tailwind + custom)

manifest.json                    # Chrome Extension manifest (MV3)
vite.config.ts                   # Vite configuration with CRXJS plugin
```

## 🔧 Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **CRXJS** - Chrome extension bundler for Vite
- **Tailwind CSS** - Styling (included in popup.css)
- **Chrome Extension API** - Native messaging, storage, content scripts

## 📋 How It Works

### 1. User Workflow

1. User visits Google Maps and performs a search (e.g., "Roofing in California")
2. User opens the extension popup
3. User configures:
   - Target row count (number of businesses to scrape)
   - Which columns to collect (Name, Website, Email, Phone, Address, Rating, Reviews, Category)
4. User clicks "Start Scraping"
5. The content script begins scrolling through results and extracting data
6. Background worker automatically enriches results with emails from websites
7. User can monitor progress via the live dashboard
8. User downloads results as CSV when complete

### 2. Content Script (`content.ts`)

- **Runs on**: `https://www.google.com/maps/*`
- **Responsibilities**:
  - Detects the Google Maps results list
  - Implements smart scrolling to load more results
  - Extracts business data using robust selectors (ARIA labels, data attributes)
  - Sends results to background worker in batches

**Key Functions**:
- `startScraping()` - Main scraping orchestrator
- `findResultsList()` - Locates the scrollable results container
- `smartScroll()` - Scrolls to trigger lazy loading
- `extractBusinessesFromDOM()` - Parses visible businesses
- `parseBusinessElement()` - Extracts individual business data

### 3. Background Service Worker (`service-worker.ts`)

- **Runs in background** - Always active (within service worker lifecycle)
- **Responsibilities**:
  - Receives scraped businesses from content script
  - Queues businesses for email enrichment
  - Fetches website HTML to extract emails
  - Manages rate limiting (2.5 second delays)
  - Stores results in Chrome storage
  - Updates dashboard statistics

**Key Features**:
- Email extraction using regex
- Deep crawl: tries `/contact` and `/about` pages if homepage has no email
- Request queue with retry logic
- CORS-compatible (service worker can fetch more URLs than content scripts)

### 4. Popup UI (`Popup.tsx`)

- **Displays**:
  - Input for target row count
  - Multi-select checkboxes for columns
  - Real-time dashboard with stats
  - Start/Stop scraping buttons
  - Download CSV button
- **Updates**: Stats refresh every 1 second during scraping
- **Styling**: Custom dark/light mode compatible UI

### 5. Utilities

**types.ts**
- `BusinessData` - Scraped business information
- `ScrapingConfig` - User configuration
- `DashboardStats` - Real-time statistics
- `StorageData` - Complete storage structure

**storage.ts**
- Manages Chrome storage with type safety
- Methods: `initStorage()`, `addResult()`, `getResults()`, `updateStats()`, etc.

**email.ts**
- `EMAIL_REGEX` - Strict email pattern matching
- `extractEmailsFromHTML()` - Find all emails in HTML
- `selectBestEmail()` - Choose most relevant email (contact@, info@, support@, etc.)
- Filters out bot/monitoring emails (noreply@, bounces, etc.)

**csv.ts**
- `generateCSV()` - Convert collected data to CSV format
- `downloadCSV()` - Trigger browser download

## 🚀 Building & Installation

### Build the Extension

```bash
npm run build
```

This creates the extension as a zip file in the `dist/` directory.

### Development Build

```bash
npm run dev
```

Runs Vite in watch mode for development.

### Load in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist/` folder from your build output

## 📊 Data Flow Diagram

```
Google Maps Page
       ↓
   [Content Script]
       ↓ (extracts via DOM)
  Sends raw business data
       ↓ (chrome.runtime.sendMessage)
 [Background Service Worker]
       ↓ (for each business)
  Fetch webpage HTML
       ↓ (extract via regex)
  Find email address
       ↓
 Store in Chrome Storage
       ↓
 Update statistics
       ↓
    [Popup UI]
       ↓ (listens to storage)
  Display real-time stats
       ↓ (user action)
 Generate & Download CSV
```

## 🔒 Permissions

The extension requires these permissions:

- `storage` - Store scraping results and config
- `scripting` - Execute content script on Maps
- `activeTab` - Interact with current tab
- `host_permissions` - Fetch from Google Maps and all URLs (for enrichment)

## ⚙️ Configuration

Users can configure:

### Target Row Count
- Minimum: 1
- Maximum: 1000 (adjustable in code)
- Default: 50

### Columns to Include
- Name
- Phone
- Website URL
- Email Address
- Physical Address
- Rating (stars)
- Review Count
- Category/Type

## 📝 Email Extraction

### Regex Pattern
Matches RFC-5322 compliant email addresses with common variations.

### Smart Selection
If multiple emails found:
1. Prioritize `contact@`
2. Then `info@`
3. Then `support@`
4. Then others

### Blacklist
Filters out:
- `noreply@` addresses
- `no-reply@` addresses
- Notification/alert addresses
- Bounce/mailer addresses
- Test or admin accounts

## 🔄 Rate Limiting

- **2.5 second delay** between website fetches
- Prevents blocking and IP bans
- Request queue processes one-by-one
- Retry logic for failed requests

## 📦 Storage Schema

```typescript
{
  teralead_config: ScrapingConfig,
  teralead_results: BusinessData[],
  teralead_stats: DashboardStats,
  teralead_is_running: boolean
}
```

## 🎨 Styling

- **Primary Color**: `#ea5455` (Teraonic red)
- **Dark Theme**: Default (light theme also supported)
- **Fonts**: Inter (Google Fonts) with system fallbacks
- **Layout**: Responsive flexbox design

## ⚠️ Known Limitations

1. **Google Maps Selectors**: Google Maps HTML changes frequently. Selectors use ARIA labels and data attributes for stability, but may need updates if Google changes their DOM structure.

2. **Website Fetching**: Some websites may block requests from extensions. CORS errors are handled gracefully.

3. **Rate Limiting**: Some websites may still block after 2.5 second delays. Consider increasing delays if needed.

4. **Email Accuracy**: Regex-based extraction may miss emails in JavaScript-rendered content or unusual formats.

## 🔧 Future Enhancements

- [ ] Proxy support for better website access
- [ ] JavaScript-rendered content parsing (Puppeteer/Playwright integration)
- [ ] More comprehensive phone number validation
- [ ] Duplicate detection across multiple searches
- [ ] Search history and scheduling
- [ ] Advanced email validation (verification)
- [ ] Custom column mapping
- [ ] API integration with CRM systems

## 📄 License

This extension is proprietary to Teraonic Software Solutions.

## 🤝 Support

For issues and feature requests, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: March 2026  
**Compatible Chrome Versions**: 88+ (MV3 required)
