import { useState, useEffect } from 'react';
import { StorageManager } from '../utils/storage';
import { GbpShared } from '../utils/shared';
import type { StorageData, ScrapingConfig } from '../utils/types';
import { Map as MapIcon, RefreshCw, Mail, Play, Square, Database, Settings, LayoutList, Globe } from 'lucide-react';
import '../index.css';

const { MSG } = GbpShared as any;

function PsychologicalProgressBar({ active, status }: { active: boolean, status: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }
    setProgress(5);
    const interval = setInterval(() => {
      setProgress(p => {
        const increment = (95 - p) * 0.04;
        return p + Math.max(increment, 0.1);
      });
    }, 500);
    return () => clearInterval(interval);
  }, [active, status]);

  if (!active) return null;

  return (
    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '12px' }}>
      <div style={{ width: `${progress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.5s ease-out' }} />
    </div>
  );
}

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

  const handleReset = async () => {
    if (confirm("Are you sure you want to completely erase the last scrape's data and reset all your settings?")) {
      await StorageManager.clearAll();
      await StorageManager.initStorage();
      const freshData = await StorageManager.getAllData();
      setData(freshData);
    }
  };

  if (!data) return <div className="loading">Loading TeraLead...</div>;

  const { stats, config, isRunning, isEnriching } = data;
  const activeStatus = isRunning ? 'running' : isEnriching ? 'enriching' : 'idle';

  return (
    <div className="tl-container">
      <header className="tl-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><MapIcon size={20} /> TeraLead Scraper</h1>
          <p style={{ margin: 0, marginTop: '2px' }}>B2B Maps Extraction & Enrichment</p>
        </div>
        <button 
          onClick={handleReset} 
          disabled={isRunning || isEnriching}
          style={{
            background: 'transparent', 
            border: '1px solid rgba(255,255,255,0.4)', 
            fontSize: '11px', 
            padding: '4px 8px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            color: '#ffffff',
            display: 'flex', alignItems: 'center', gap: '4px',
            whiteSpace: 'nowrap'
          }}
          title="Wipe previous data and start fresh"
        >
          <RefreshCw size={12} /> New Scrape
        </button>
      </header>

      <section className="tl-dashboard">
        <div className="tl-stats-grid">
          <div className="tl-stat-box">
            <span className="tl-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><LayoutList size={12} /> Scraped</span>
            <span className="tl-value">{stats.processed}</span>
          </div>
          <div className="tl-stat-box">
            <span className="tl-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Globe size={12} /> Visited</span>
            <span className="tl-value">{stats.sitePagesVisited}</span>
          </div>
          <div className="tl-stat-box highlight">
            <span className="tl-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Mail size={12} /> Emails</span>
            <span className="tl-value">{stats.emailsFound}</span>
          </div>
        </div>
        <div className="tl-status-bar">
          Status: <strong className={isRunning ? 'running' : isEnriching ? 'enriching' : 'ready'}>
            {isRunning ? 'Scraping Google Maps...' : isEnriching ? 'Hunting Emails Deep Web...' : 'Ready / Idle'}
          </strong>
          <PsychologicalProgressBar active={isRunning || isEnriching} status={activeStatus} />
        </div>
      </section>

      <section className="tl-settings">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Settings size={16} /> Configuration</h2>
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
              <span style={{textTransform: 'capitalize', color: '#1e293b', fontWeight: 500}}>{colName.replace('_', ' ')}</span>
            </label>
          ))}
        </div>

        <h3>Deep Email Enrichment</h3>
        <label className="tl-enrich-toggle" style={{color: '#1e293b', fontWeight: 500}}>
          <input 
            type="checkbox" 
            checked={config.enableEnrichment !== false} 
            onChange={e => updateConfig('enableEnrichment', e.target.checked)} 
          />
          Automatically visit target websites to extract emails
        </label>

        <h3 style={{marginTop: '16px'}}>Strict Scrape Mode</h3>
        <label className="tl-enrich-toggle" style={{background: '#f1f5f9', borderColor: '#cbd5e1', color: '#1e293b', fontWeight: 500}}>
          <input 
            type="checkbox" 
            checked={config.strictColumnMatch || false} 
            onChange={e => updateConfig('strictColumnMatch', e.target.checked)} 
          />
          Skip rows missing ANY selected columns (Wait for replacements)
        </label>
      </section>

      <div className="tl-actions">
        <button className="tl-btn tl-btn-viewer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => chrome.tabs.create({ url: 'src/results/results.html' })}>
          <Database size={16} /> Results Tracker
        </button>
        <button className="tl-btn tl-btn-stop" disabled={!isRunning && !isEnriching} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={handleStop}>
          <Square size={16} /> Stop All
        </button>
        <button className="tl-btn tl-btn-primary" disabled={isRunning || isEnriching} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={handleStart}>
          <Play size={16} /> {isRunning ? 'Scraping...' : 'Start Scrape'}
        </button>
      </div>
    </div>
  );
}
