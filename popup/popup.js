const statusEl = document.getElementById('status');
const currentDataEl = document.getElementById('currentData');
const historyListEl = document.getElementById('historyList');

const refreshBtn = document.getElementById('refreshBtn');
const saveBtn = document.getElementById('saveBtn');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');

const titleEl = document.getElementById('title');
const currentDataTitleEl = document.getElementById('currentDataTitle');
const historyTitleEl = document.getElementById('historyTitle');

let currentData = null;

// Initialize UI with i18n
function initUI() {
  titleEl.textContent = t('title') + ' 1.0.0';
  currentDataTitleEl.textContent = t('currentData');
  historyTitleEl.textContent = t('history');
  refreshBtn.textContent = t('refreshBtn');
  saveBtn.textContent = t('saveBtn');
  exportBtn.textContent = t('exportBtn');
  clearBtn.textContent = t('clearBtn');
  currentDataEl.textContent = t('notRead');
  statusEl.textContent = t('ready');
}

function setStatus(text) {
  statusEl.textContent = text;
}

function renderCurrentData(data) {
  currentDataEl.textContent = JSON.stringify(data, null, 2);
}

function renderHistory(items) {
  historyListEl.innerHTML = '';

  if (!items.length) {
    const li = document.createElement('li');
    li.textContent = t('noHistory');
    historyListEl.appendChild(li);
    return;
  }

  items
    .slice()
    .reverse()
    .forEach((item) => {
      const li = document.createElement('li');
      li.textContent = `${item.capturedAt} | ${item.price || '-'} | ${item.rating || '-'} | ${item.reviews || '-'}`;
      historyListEl.appendChild(li);
    });
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function captureFromPage() {
  const tab = await getActiveTab();
  if (!tab?.id || !tab.url?.includes('amazon.')) {
    throw new Error(t('openOnAmazon'));
  }

  const response = await chrome.tabs.sendMessage(tab.id, { type: 'CAPTURE_PAGE_DATA' });
  if (!response?.ok) {
    throw new Error(response?.error || 'Read failed.');
  }

  return response.data;
}

async function loadHistory(asin) {
  if (!asin) {
    renderHistory([]);
    return;
  }

  const response = await chrome.runtime.sendMessage({ type: 'GET_SNAPSHOTS', asin });
  renderHistory(response?.data || []);
}

async function refresh() {
  try {
    setStatus(t('reading'));
    currentData = await captureFromPage();
    renderCurrentData(currentData);
    await loadHistory(currentData.asin);
    setStatus(t('readSuccess'));
  } catch (error) {
    setStatus(error.message);
    currentDataEl.textContent = t('readFailed');
    historyListEl.innerHTML = '';
  }
}

async function saveSnapshot() {
  if (!currentData?.asin) {
    setStatus(t('noDataToSave'));
    return;
  }

  const response = await chrome.runtime.sendMessage({
    type: 'SAVE_SNAPSHOT',
    payload: currentData
  });

  if (!response?.ok) {
    setStatus(response?.error || t('saveFailed'));
    return;
  }

  await loadHistory(currentData.asin);
  setStatus(t('saveSuccess', { count: response.count }));
}

function exportJson() {
  if (!currentData?.asin) {
    setStatus(t('noHistoryExport'));
    return;
  }

  chrome.runtime
    .sendMessage({ type: 'GET_SNAPSHOTS', asin: currentData.asin })
    .then((response) => {
      const blob = new Blob([JSON.stringify(response?.data || [], null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentData.asin}-snapshots.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(t('exportSuccess'));
    });
}

async function clearCurrentAsinHistory() {
  if (!currentData?.asin) {
    setStatus(t('noAsinClear'));
    return;
  }

  await chrome.runtime.sendMessage({ type: 'CLEAR_SNAPSHOTS', asin: currentData.asin });
  await loadHistory(currentData.asin);
  setStatus(t('clearSuccess'));
}

refreshBtn.addEventListener('click', refresh);
saveBtn.addEventListener('click', saveSnapshot);
exportBtn.addEventListener('click', exportJson);
clearBtn.addEventListener('click', clearCurrentAsinHistory);

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  refresh();
});
