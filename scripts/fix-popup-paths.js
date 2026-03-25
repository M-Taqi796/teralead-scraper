#!/usr/bin/env node
/**
 * Post-build script to fix CRXJS absolute paths for extension popups
 * Converts /assets/... to ./assets/... for proper loading in extension context
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const popupPath = path.join(__dirname, '../dist/popup.html');

try {
  let content = fs.readFileSync(popupPath, 'utf-8');
  
  // Convert absolute paths to relative paths
  // /assets/... becomes ./assets/...
  content = content.replace(/src="\/assets\//g, 'src="./assets/');
  content = content.replace(/href="\/assets\//g, 'href="./assets/');
  
  // Remove crossorigin attribute which can break Chrome extension popups for local files
  content = content.replace(/ crossorigin/g, '');
  
  fs.writeFileSync(popupPath, content, 'utf-8');
  console.log('✓ Fixed popup.html paths');
} catch (error) {
  console.error('Error fixing popup paths:', error);
  process.exit(1);
}
