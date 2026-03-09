const statusEl = document.getElementById('status');
const currentDataEl = document.getElementById('currentData');
const historyListEl = document.getElementById('historyList');

const refreshBtn = document.getElementById('refreshBtn');
const saveBtn = document.getElementById('saveBtn');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');

let currentData = null;

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
    li.textContent = '暂无历史记录';
    historyListEl.appendChild(li);
    return;
  }

  items
    .slice()
    .reverse()
    .forEach((item) => {
      const li = document.createElement('li');
      li.textContent = `${item.capturedAt} | ${item.price || '无价格'} | ${item.rating || '无评分'} | ${item.reviews || '无评论数'}`;
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
    throw new Error('请在 Amazon 商品页面打开插件。');
  }

  const response = await chrome.tabs.sendMessage(tab.id, { type: 'CAPTURE_PAGE_DATA' });
  if (!response?.ok) {
    throw new Error(response?.error || '读取页面数据失败。');
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
    setStatus('正在读取页面...');
    currentData = await captureFromPage();
    renderCurrentData(currentData);
    await loadHistory(currentData.asin);
    setStatus('读取成功。');
  } catch (error) {
    setStatus(error.message);
    currentDataEl.textContent = '读取失败';
    historyListEl.innerHTML = '';
  }
}

async function saveSnapshot() {
  if (!currentData?.asin) {
    setStatus('无可保存数据，请先刷新读取。');
    return;
  }

  const response = await chrome.runtime.sendMessage({
    type: 'SAVE_SNAPSHOT',
    payload: currentData
  });

  if (!response?.ok) {
    setStatus(response?.error || '保存失败。');
    return;
  }

  await loadHistory(currentData.asin);
  setStatus(`已保存，当前商品共 ${response.count} 条记录。`);
}

function exportJson() {
  if (!currentData?.asin) {
    setStatus('没有可导出的商品历史。');
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
      setStatus('导出完成。');
    });
}

async function clearCurrentAsinHistory() {
  if (!currentData?.asin) {
    setStatus('当前商品无 ASIN，无法清空。');
    return;
  }

  await chrome.runtime.sendMessage({ type: 'CLEAR_SNAPSHOTS', asin: currentData.asin });
  await loadHistory(currentData.asin);
  setStatus('已清空该商品历史。');
}

refreshBtn.addEventListener('click', refresh);
saveBtn.addEventListener('click', saveSnapshot);
exportBtn.addEventListener('click', exportJson);
clearBtn.addEventListener('click', clearCurrentAsinHistory);

document.addEventListener('DOMContentLoaded', refresh);
