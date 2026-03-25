import type { StorageData, BusinessData, DashboardStats, ScrapingConfig } from './types';

const STORAGE_KEYS = {
  CONFIG: 'teralead_config',
  RESULTS: 'teralead_results',
  STATS: 'teralead_stats',
  IS_RUNNING: 'teralead_is_running',
  IS_ENRICHING: 'teralead_is_enriching',
};

const DEFAULT_CONFIG: ScrapingConfig = {
  maxRows: 200,
  infiniteScroll: false,
  filters: {},
  columns: {
    name: true,
    category: true,
    email: true,
    phone: true,
    rating: true,
    reviews: true,
    website: true,
    address: true,
  },
  enableEnrichment: true,
  strictColumnMatch: false,
};

const DEFAULT_STATS: DashboardStats = {
  processed: 0,
  matched: 0,
  duplicates: 0,
  fastSkipped: 0,
  errors: 0,
  emailsFound: 0,
  discoveryEmailsFound: 0,
  sitePagesVisited: 0,
  sitePagesDiscovered: 0,
  socialPagesScanned: 0,
  seenListings: 0,
  seenRatingSum: 0,
  seenRatingCount: 0,
  seenReviewsSum: 0,
  seenReviewsCount: 0,
  stopped: false,
};

export const StorageManager = {
  async initStorage(): Promise<void> {
    const stored = await chrome.storage.local.get(Object.values(STORAGE_KEYS));
    if (!stored[STORAGE_KEYS.CONFIG]) {
      await chrome.storage.local.set({ [STORAGE_KEYS.CONFIG]: DEFAULT_CONFIG });
    }
    if (!stored[STORAGE_KEYS.RESULTS]) {
      await chrome.storage.local.set({ [STORAGE_KEYS.RESULTS]: [] });
    }
    if (!stored[STORAGE_KEYS.STATS]) {
      await chrome.storage.local.set({ [STORAGE_KEYS.STATS]: DEFAULT_STATS });
    }
    if (!stored[STORAGE_KEYS.IS_RUNNING]) {
      await chrome.storage.local.set({ [STORAGE_KEYS.IS_RUNNING]: false });
    }
    if (!stored[STORAGE_KEYS.IS_ENRICHING]) {
      await chrome.storage.local.set({ [STORAGE_KEYS.IS_ENRICHING]: false });
    }
  },

  async getAllData(): Promise<StorageData> {
    const stored = await chrome.storage.local.get(Object.values(STORAGE_KEYS)) as Record<string, unknown>;
    return {
      config: (stored[STORAGE_KEYS.CONFIG] as ScrapingConfig) || DEFAULT_CONFIG,
      results: (stored[STORAGE_KEYS.RESULTS] as BusinessData[]) || [],
      stats: (stored[STORAGE_KEYS.STATS] as DashboardStats) || DEFAULT_STATS,
      isRunning: (stored[STORAGE_KEYS.IS_RUNNING] as boolean) || false,
      isEnriching: (stored[STORAGE_KEYS.IS_ENRICHING] as boolean) || false,
    };
  },

  async updateConfig(config: ScrapingConfig): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEYS.CONFIG]: config });
  },

  async addResult(business: BusinessData): Promise<void> {
    const stored = await chrome.storage.local.get(STORAGE_KEYS.RESULTS) as Record<string, unknown>;
    const results: BusinessData[] = (stored[STORAGE_KEYS.RESULTS] as BusinessData[]) || [];
    const existingIdx = results.findIndex(r => r.place_id === business.place_id || (r.maps_url && r.maps_url === business.maps_url));
    if (existingIdx >= 0) {
      results[existingIdx] = { ...results[existingIdx], ...business };
    } else {
      results.push(business);
    }
    await chrome.storage.local.set({ [STORAGE_KEYS.RESULTS]: results });
  },

  async getResults(): Promise<BusinessData[]> {
    const stored = await chrome.storage.local.get(STORAGE_KEYS.RESULTS) as Record<string, unknown>;
    return (stored[STORAGE_KEYS.RESULTS] as BusinessData[]) || [];
  },

  async updateStats(stats: DashboardStats): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEYS.STATS]: stats });
  },

  async getStats(): Promise<DashboardStats> {
    const stored = await chrome.storage.local.get(STORAGE_KEYS.STATS) as Record<string, unknown>;
    return (stored[STORAGE_KEYS.STATS] as DashboardStats) || DEFAULT_STATS;
  },

  async setRunning(isRunning: boolean): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEYS.IS_RUNNING]: isRunning });
  },

  async isRunning(): Promise<boolean> {
    const stored = await chrome.storage.local.get(STORAGE_KEYS.IS_RUNNING) as Record<string, unknown>;
    return (stored[STORAGE_KEYS.IS_RUNNING] as boolean) || false;
  },

  async setEnriching(isEnriching: boolean): Promise<void> {
    await chrome.storage.local.set({ 'teralead_is_enriching': isEnriching });
  },

  async clearAll(): Promise<void> {
    await chrome.storage.local.clear();
    await this.initStorage();
  },
};
