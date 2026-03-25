# TeraLead Scraper

TeraLead is a powerful Chrome extension built to seamlessly extract rich B2B leads from Google Maps. It features deep website enrichment that works silently in the background, a fully configurable data pipeline, and an intuitive popup and results viewer. 

## Features

- **Google Maps Data Extraction:** Automatically searches and scrolls through Maps to grab names, phones, ratings, reviews, and websites.
- **Deep Email Enrichment:** Silently visits discovered websites (including `/contact` and `/about` pages) in the background to harvest business email addresses.
- **Strict Verification Mode:** Configure strict column requirements. If an email is required, the scraper will pause its list, execute a deep fetch on the site, and drop the lead if no email is found—ensuring you get exactly what you need without breaking row quotas.
- **Column Customization:** Granularly check which exact fields you want exported.
- **CSV Exporter:** Included native Results Tracker table to verify and download precisely filtered CSV datasets.

## Development Setup

The project runs on Vite, React, and TypeScript.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- npm or yarn
- Google Chrome

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone git@github.com:M-Taqi796/teralead-scraper.git
cd teralead-scraper
npm install
```

### 3. Build the Extension
Compile the React code and manifest into the distributable Chrome extension format:
```bash
npm run build
```
*(The build output will be generated into the `dist/` directory.)*

## Usage in Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
2. Toggle the **Developer mode** switch in the top right corner.
3. Click the **Load unpacked** button in the top left.
4. Select the `dist/` directory that was generated inside the `teralead-scraper` folder.
5. The TeraLead Scraper icon will now be available in your Chrome toolbar. Pin it for quick access!

## Running a Scrape

1. Open [Google Maps](https://www.google.com/maps).
2. Enter your desired search term (e.g., "Landscaping in Colorado").
3. Click the TeraLead extension icon in your toolbar to open the Control Panel.
4. **Configure your scrape:**
   - **Max Rows:** Select how many valid leads you want.
   - **Export Columns:** Check the specific data points you require.
   - **Deep Email Enrichment:** Enable to automatically discover emails from websites.
   - **Strict Scrape Mode:** Enable to forcefully drop rows that miss *any* of your selected Export Columns resulting in a perfectly clean dataset. 
5. Click **Start Scrape**. You can track the progress dynamically as it sweeps maps and runs background enrichment.
6. Once finished, click **Results Tracker** to verify your dataset and select **Download CSV**.
