// Popup loader - handles dynamic script loading to work around CRXJS path issues
(async () => {
  try {
    // Dynamically import the popup component
    const module = await import(chrome.runtime.getURL('assets/popup.html-csB6oKvq.js'));
    console.log('[TeraLead] Popup loaded successfully');
  } catch (error) {
    console.error('[TeraLead] Failed to load popup:', error);
    document.getElementById('root').innerHTML = `
      <div style="padding: 20px; color: red; font-family: sans-serif;">
        <h2>Error Loading Extension</h2>
        <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p>Please try reloading the extension.</p>
      </div>
    `;
  }
})();
