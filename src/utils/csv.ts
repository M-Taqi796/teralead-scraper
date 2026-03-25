import type { BusinessData, ScrapingConfig } from './types';

export function generateCSV(data: BusinessData[], config: ScrapingConfig): string {
  const headers = [];
  if (config.columns.name) headers.push('name');
  if (config.columns.phone) headers.push('phone');
  if (config.columns.website) headers.push('website');
  if (config.columns.email) headers.push('email');
  if (config.columns.address) headers.push('address');
  if (config.columns.rating) headers.push('rating');
  if (config.columns.reviews) headers.push('review_count');
  if (config.columns.category) headers.push('category');

  const csvLines = [];
  csvLines.push(headers.map(h => escapeCSVField(h.toUpperCase())).join(','));
  
  for (const row of data) {
    const csvRow = headers.map(header => {
      let value = row[header as keyof BusinessData];
      if (header === 'phone' && !value) {
        value = row.listing_phone || row.website_phone;
      }
      if (header === 'email' && !value) {
        value = row.primary_email || row.contact_email || row.owner_email;
      }
      if (value === undefined || value === null) return '';
      return escapeCSVField(String(value));
    });
    csvLines.push(csvRow.join(','));
  }
  return csvLines.join('\n');
}

function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return field;
}

export function downloadCSV(csvContent: string, filename = 'teralead-data.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
