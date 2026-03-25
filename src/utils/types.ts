// Shared types for the extension

export interface BusinessData {
  place_id: string;
  name: string;
  rating: number | string;
  review_count: number | string;
  category: string;
  address: string;
  phone: string;
  listing_phone: string;
  website_phone: string;
  website_phone_source: string;
  website: string;
  listing_facebook: string;
  facebook_could_be: string;
  email: string;
  owner_name: string;
  owner_title: string;
  owner_email: string;
  contact_email: string;
  primary_email: string;
  primary_email_type: string;
  primary_email_source: string;
  owner_confidence?: string;
  email_confidence?: string;
  email_source_url?: string;
  no_email_reason?: string;
  website_scan_status: string;
  site_pages_visited: number;
  site_pages_discovered: number;
  social_pages_scanned: number;
  social_links: string;
  discovery_status: string;
  discovery_source: string;
  discovery_query: string;
  discovered_website: string;
  hours: string;
  maps_url: string;
  source_query: string;
  source_url: string;
  scraped_at: string;
  emailFoundAt?: number;
}

export interface ScrapingConfig {
  maxRows: number;
  infiniteScroll: boolean;
  filters: {
    minRating?: number | string;
    maxRating?: number | string;
    minReviews?: number | string;
    maxReviews?: number | string;
    nameKeyword?: string;
    categoryInclude?: string;
    categoryExclude?: string;
    hasWebsite?: boolean;
    hasPhone?: boolean;
    hasEmail?: boolean;
    requireEmailForLeads?: boolean;
  };
  columns: {
    name: boolean;
    category: boolean;
    email: boolean;
    phone: boolean;
    rating: boolean;
    reviews: boolean;
    website: boolean;
    address: boolean;
  };
  runId?: string;
  runTabId?: number;
  enableEnrichment?: boolean; // Background email fetch feature
  strictColumnMatch?: boolean; // Skip rows missing selected columns
}

export interface DashboardStats {
  processed: number;
  matched: number;
  duplicates: number;
  fastSkipped: number;
  errors: number;
  emailsFound: number;
  discoveryEmailsFound: number;
  sitePagesVisited: number;
  sitePagesDiscovered: number;
  socialPagesScanned: number;
  seenListings: number;
  seenRatingSum: number;
  seenRatingCount: number;
  seenReviewsSum: number;
  seenReviewsCount: number;
  speedStat?: string;
  stopped?: boolean;
}

export interface StorageData {
  config: ScrapingConfig;
  results: BusinessData[];
  stats: DashboardStats;
  isRunning: boolean;
  isEnriching: boolean;
}
