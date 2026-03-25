import { useState, useEffect } from 'react';
import { StorageManager } from '../utils/storage';
import { GbpShared } from '../utils/shared';
import type { StorageData, ScrapingConfig } from '../utils/types';
import '../index.css';

const { MSG } = GbpShared as any;

export default function Popup() {
  const [data, setData] = useState<StorageData | null>(null);

  useEffect(() => {
    StorageManager.getAllData().then(setData);

    const listener = () => {
      StorageManager.getAllData().then(setData);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const updateConfig = (field: keyof ScrapingConfig, value: any) => {
    if (!data) return;
    const newConfig = { ...data.config, [field]: value };
    StorageManager.updateConfig(newConfig).then(() => setData((prev: StorageData | null) => ({...prev!, config: newConfig})));
  };

  const updateColumn = (col: keyof ScrapingConfig['columns'], checked: boolean) => {
    if (!data || !data.config.columns) return;
    const newConfig = {
      ...data.config,
      columns: { ...data.config.columns, [col]: checked }
    };
    StorageManager.updateConfig(newConfig).then(() => setData((prev: StorageData | null) => ({...prev!, config: newConfig})));
  };

  const handleStart = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        chrome.runtime.sendMessage({ type: MSG.START_SCRAPE });
        chrome.tabs.sendMessage(activeTab.id, { 
          type: MSG.START_SCRAPE, 
          config: { ...data?.config, runTabId: activeTab.id } 
        });
      }
    });
  };

  const handleStop = () => {
    chrome.runtime.sendMessage({ type: MSG.STOP_SCRAPE });
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: MSG.STOP_SCRAPE });
      }
    });
  };

  if (!data) return <div className="loading">Loading TeraLead...</div>;

  const { stats, config, isRunning, isEnriching } = data;

  return (
    <div className="tl-container">
      <header className="tl-header">
        <h1>TeraLead Scraper</h1>
        <p>B2B Maps Extraction & Enrichment</p>
      </header>

      <section className="tl-dashboard">
        <div className="tl-stats-grid">
          <div className="tl-stat-box">
            <span className="tl-label">Scraped</span>
            <span className="tl-value">{stats.processed}</span>
          </div>
          <div className="tl-stat-box">
            <span className="tl-label">Visited</span>
            <span className="tl-value">{stats.sitePagesVisited}</span>
          </div>
          <div className="tl-stat-box highlight">
            <span className="tl-label">Emails</span>
            <span className="tl-value">{stats.emailsFound}</span>
          </div>
        </div>
        <div className="tl-status-bar">
          Status: <strong className={isRunning ? 'running' : isEnriching ? 'enriching' : 'ready'}>
            {isRunning ? 'Scraping Google Maps...' : isEnriching ? 'Hunting Emails Deep Web...' : 'Ready / Idle'}
          </strong>
        </div>
      </section>

      <section className="tl-settings">
        <h2>Configuration</h2>
        <div className="tl-input-group">
          <label>Max Rows to Scrape:</label>
          <input 
            type="number" 
            value={config.maxRows} 
            onChange={e => updateConfig('maxRows', parseInt(e.target.value))} 
            disabled={config.infiniteScroll}
          />
        </div>
        <div className="tl-checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={config.infiniteScroll} 
              onChange={e => updateConfig('infiniteScroll', e.target.checked)} 
            />
            Infinite Scroll (Ignore max limit)
          </label>
        </div>
        
        <h3>Export Columns</h3>
        <div className="tl-columns-grid">
          {config.columns && Object.entries(config.columns).map(([colName, isChecked]) => (
            <label key={colName} className="tl-col-chk">
              <input 
                type="checkbox" 
                checked={isChecked as boolean} 
                onChange={e => updateColumn(colName as keyof ScrapingConfig['columns'], e.target.checked)}
              />
              <span style={{textTransform: 'capitalize'}}>{colName.replace('_', ' ')}</span>
            </label>
          ))}
        </div>

        <h3>Deep Email Enrichment</h3>
        <label className="tl-enrich-toggle">
          <input 
            type="checkbox" 
            checked={config.enableEnrichment !== false} 
            onChange={e => updateConfig('enableEnrichment', e.target.checked)} 
          />
          Automatically visit target websites to extract emails
        </label>
      </section>

      <div className="tl-actions">
        <button className="tl-btn tl-btn-viewer" onClick={() => chrome.tabs.create({ url: 'src/results/results.html' })}>
          Results Tracker
        </button>
        <button className="tl-btn tl-btn-stop" disabled={!isRunning && !isEnriching} onClick={handleStop}>
          Stop All
        </button>
        <button className="tl-btn tl-btn-primary" disabled={isRunning || isEnriching} onClick={handleStart}>
          {isRunning ? 'Scraping...' : 'Start Scrape'}
        </button>
      </div>
    </div>
  );
}
