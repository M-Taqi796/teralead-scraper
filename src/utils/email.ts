// Email extraction utilities

/**
 * Strict email regex that matches most common email formats
 * Based on a simplified RFC 5322 pattern
 */
export const EMAIL_REGEX = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.(?:[a-zA-Z0-9]{2,})/g;

/**
 * Extract email addresses from HTML content
 * Returns unique emails only
 */
export function extractEmailsFromHTML(html: string): string[] {
  const matches = html.match(EMAIL_REGEX);
  if (!matches) return [];
  
  // Filter out common false positives
  const filtered = matches
    .map(email => email.toLowerCase())
    .filter(email => {
      // Exclude monitoring/bot emails
      if (email.includes('noreply') || email.includes('no-reply')) return false;
      if (email.includes('notification') || email.includes('alert')) return false;
      if (email.includes('bounce') || email.includes('mailer')) return false;
      if (email.startsWith('test@') || email.startsWith('admin@')) return false;
      return true;
    });
  
  // Return unique emails
  return Array.from(new Set(filtered));
}

/**
 * Find the most relevant email from a list (prioritize support, info, contact)
 */
export function selectBestEmail(emails: string[]): string | undefined {
  if (emails.length === 0) return undefined;
  
  const priority = ['contact@', 'info@', 'support@', 'hello@', 'sales@'];
  
  for (const prefix of priority) {
    const match = emails.find(email => email.startsWith(prefix));
    if (match) return match;
  }
  
  // Return first email as fallback
  return emails[0];
}
