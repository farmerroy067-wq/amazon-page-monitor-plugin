// Simple i18n helper for bilingual support (English/Chinese)
const i18n = {
  en: {
    // Popup UI
    title: 'Amazon Page Monitor',
    ready: 'Ready.',
    currentData: 'Current Page Data',
    history: 'History',
    noHistory: 'No history',
    notRead: 'Not read',
    readFailed: 'Read failed',

    // Buttons
    refreshBtn: 'Refresh',
    saveBtn: 'Save Snapshot',
    exportBtn: 'Export JSON',
    clearBtn: 'Clear History',

    // Status messages
    reading: 'Reading page...',
    readSuccess: 'Read successful.',
    noDataToSave: 'No data to save. Please refresh first.',
    saveSuccess: 'Saved. Total {count} records for this product.',
    saveFailed: 'Save failed.',
    noHistoryExport: 'No product history to export.',
    exportSuccess: 'Export complete.',
    noAsinClear: 'Current product has no ASIN. Cannot clear.',
    clearSuccess: 'History cleared for this product.',
    openOnAmazon: 'Please open the extension on an Amazon product page.',

    // Background messages
    missingAsin: 'Missing ASIN. Cannot save snapshot.',
    unknownMessageType: 'Unknown message type.'
  },

  zh: {
    // Popup UI
    title: 'Amazon 页面监控',
    ready: '准备就绪。',
    currentData: '当前页面数据',
    history: '历史记录',
    noHistory: '暂无历史记录',
    notRead: '未读取',
    readFailed: '读取失败',

    // Buttons
    refreshBtn: '刷新读取',
    saveBtn: '保存快照',
    exportBtn: '导出 JSON',
    clearBtn: '清空历史',

    // Status messages
    reading: '正在读取页面...',
    readSuccess: '读取成功。',
    noDataToSave: '无可保存数据，请先刷新读取。',
    saveSuccess: '已保存，当前商品共 {count} 条记录。',
    saveFailed: '保存失败。',
    noHistoryExport: '没有可导出的商品历史。',
    exportSuccess: '导出完成。',
    noAsinClear: '当前商品无 ASIN，无法清空。',
    clearSuccess: '已清空该商品历史。',
    openOnAmazon: '请在 Amazon 商品页面打开插件。',

    // Background messages
    missingAsin: '缺少 ASIN，无法保存快照。',
    unknownMessageType: '未知消息类型。'
  }
};

// Get browser language (default to English)
function getLocale() {
  const lang = navigator.language || navigator.userLanguage || 'en';
  return lang.startsWith('zh') ? 'zh' : 'en';
}

// Get translated text
function t(key, params = {}) {
  const locale = getLocale();
  let text = i18n[locale]?.[key] || i18n['en'][key] || key;

  // Replace placeholders like {count}
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param]);
  });

  return text;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { t, getLocale, i18n };
}
