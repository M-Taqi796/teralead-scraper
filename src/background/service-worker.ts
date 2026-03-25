import { StorageManager } from '../utils/storage';
import { extractEmailsFromHTML, selectBestEmail } from '../utils/email';
import type { BusinessData } from '../utils/types';
import { GbpShared } from '../utils/shared';

const { MSG } = GbpShared as any;

const requestQueue: Array<{ business: BusinessData; retries: number }> = [];
let isProcessingQueue = false;
const DELAY_BETWEEN_REQUESTS = 2500;
const MAX_RETRIES = 1;

chrome.runtime.onInstalled.addListener(async () => {
  await StorageManager.initStorage();
  console.log('[TeraLead] Extension installed and storage initialized');
});

chrome.runtime.onMessage.addListener((request: any, _sender: chrome.runtime.MessageSender, _sendResponse: (response?: any) => void) => {
  if (request.type === MSG.SCRAPE_PROGRESS || request.type === MSG.SCRAPE_DONE) {
    handleScrapingUpdates(request).catch(console.error);
    return false;
  }
  if (request.type === MSG.START_SCRAPE) {
    StorageManager.setRunning(true).catch(console.error);
    return false; 
  }
  if (request.type === MSG.STOP_SCRAPE) {
    StorageManager.setRunning(false).catch(console.error);
    return false;
  }
});

async function handleScrapingUpdates(request: any) {
  if (request.summary) {
    const stats = await StorageManager.getStats();
    stats.processed = request.summary.processed || stats.processed;
    stats.matched = request.summary.matched || stats.matched;
    stats.duplicates = request.summary.duplicates || stats.duplicates;
    stats.errors = request.summary.errors || stats.errors;
    stats.fastSkipped = request.summary.fast_skipped || stats.fastSkipped;
    stats.seenListings = request.summary.seenListings || stats.seenListings;
    stats.seenRatingSum = request.summary.seenRatingSum || stats.seenRatingSum;
    stats.seenRatingCount = request.summary.seenRatingCount || stats.seenRatingCount;
    stats.seenReviewsSum = request.summary.seenReviewsSum || stats.seenReviewsSum;
    stats.seenReviewsCount = request.summary.seenReviewsCount || stats.seenReviewsCount;
    stats.speedStat = request.summary.speedStat || stats.speedStat;
    if (request.type === MSG.SCRAPE_DONE) {
      stats.stopped = request.summary.stopped;
    }
    await StorageManager.updateStats(stats);
  }

  if (request.rows && Array.isArray(request.rows)) {
    for (const row of request.rows) {
      await StorageManager.addResult(row);
    }
    
    if (request.type === MSG.SCRAPE_DONE) {
      const config = (await StorageManager.getAllData()).config;
      if (config.enableEnrichment !== false) {
        startEnrichmentQueue(request.rows);
      }
      await StorageManager.setRunning(false);
    }
  }
}

function startEnrichmentQueue(businesses: BusinessData[]) {
  let queued = false;
  for (const business of businesses) {
    if (business.website && !business.email && !business.primary_email && !business.contact_email) {
      requestQueue.push({ business, retries: 0 });
      queued = true;
    }
  }
  
  if (queued && !isProcessingQueue) {
    StorageManager.setEnriching(true).catch(console.error);
    processEnrichmentQueue();
  }
}

async function processEnrichmentQueue() {
  if (isProcessingQueue || requestQueue.length === 0) {
    await StorageManager.setEnriching(false);
    return;
  }
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const item = requestQueue.shift();
    if (!item) break;
    
    try {
      const enriched = await enrichBusiness(item.business);
      await StorageManager.addResult(enriched);
      
      const stats = await StorageManager.getStats();
      if (enriched.email || enriched.primary_email) {
        stats.emailsFound++;
      }
      stats.sitePagesVisited += enriched.site_pages_visited;
      stats.sitePagesDiscovered += enriched.site_pages_discovered;
      
      await StorageManager.updateStats(stats);
      await delay(DELAY_BETWEEN_REQUESTS);
    } catch (error) {
      console.error(`[TeraLead] Error enriching business ${item.business.name}:`, error);
      if (item.retries < MAX_RETRIES) {
        item.retries++;
        requestQueue.push(item);
      }
    }
  }
  
  isProcessingQueue = false;
  await StorageManager.setEnriching(false);
}

async function enrichBusiness(business: BusinessData): Promise<BusinessData> {
  const enriched = { ...business };
  if (!enriched.website) return enriched;
  
  try {
    let email = await fetchEmailFromURL(enriched.website);
    enriched.site_pages_visited++;

    if (!email) {
      const contactUrl = `${enriched.website.replace(/\/$/, '')}/contact`;
      email = await fetchEmailFromURL(contactUrl);
      enriched.site_pages_visited++;
    }
    
    if (!email) {
      const aboutUrl = `${enriched.website.replace(/\/$/, '')}/about`;
      email = await fetchEmailFromURL(aboutUrl);
      enriched.site_pages_visited++;
    }
    
    if (email) {
      enriched.email = email;
      enriched.primary_email = email;
      enriched.primary_email_type = 'scanned';
      enriched.emailFoundAt = Date.now();
      enriched.website_scan_status = 'success';
    } else {
      enriched.website_scan_status = 'no_email';
    }
  } catch (error) {
    enriched.website_scan_status = 'error';
    console.warn(`[TeraLead] Could not enrich ${business.name}:`, error);
  }
  
  return enriched;
}

async function fetchEmailFromURL(url: string): Promise<string | undefined> {
  try {
    let fullUrl = url;
    if (!fullUrl.startsWith('http')) fullUrl = `https://${url}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    if (!response.ok) return undefined;
    
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('text/html')) return undefined;
    
    const html = await response.text();
    const emails = extractEmailsFromHTML(html);
    return selectBestEmail(emails);
  } catch (error) {
    return undefined;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
