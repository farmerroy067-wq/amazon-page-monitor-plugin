function pickText(selectors) {
  for (const selector of selectors) {
    const node = document.querySelector(selector);
    if (node && node.textContent) {
      const text = node.textContent.trim();
      if (text) return text;
    }
  }
  return "";
}

function pickAttr(selectors, attrName) {
  for (const selector of selectors) {
    const node = document.querySelector(selector);
    if (node) {
      const value = node.getAttribute(attrName);
      if (value) return value.trim();
    }
  }
  return "";
}

function getAsinFromUrl() {
  const match = window.location.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  if (match && match[1]) return match[1].toUpperCase();

  const asinInput = document.querySelector('#ASIN, input[name="ASIN"]');
  return asinInput?.value?.trim()?.toUpperCase() || "";
}

function extractRankText() {
  const candidates = [
    '#detailBulletsWrapper_feature_div',
    '#prodDetails',
    '#productDetails_detailBullets_sections1'
  ];

  for (const selector of candidates) {
    const text = pickText([selector]);
    if (!text) continue;
    const rankLine = text
      .split('\n')
      .map((line) => line.trim())
      .find((line) => /best sellers rank|畅销商品排名|売れ筋ランキング/i.test(line));
    if (rankLine) return rankLine;
  }

  return "";
}

function extractAmazonData() {
  const now = new Date().toISOString();
  const asin = getAsinFromUrl();
  const title = pickText(['#productTitle']);
  const price = pickText([
    '#corePrice_feature_div .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.a-price .a-offscreen'
  ]);
  const rating = pickAttr(['#acrPopover', 'i[data-hook="average-star-rating"]'], 'title') ||
    pickText(['span[data-hook="rating-out-of-text"]']);
  const reviews = pickText(['#acrCustomerReviewText', 'span[data-hook="total-review-count"]']);
  const rank = extractRankText();

  return {
    asin,
    title,
    price,
    rating,
    reviews,
    rank,
    url: window.location.href,
    capturedAt: now
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'CAPTURE_PAGE_DATA') {
    sendResponse({ ok: true, data: extractAmazonData() });
  }
});
