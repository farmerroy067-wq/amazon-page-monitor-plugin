const STORAGE_KEY = 'amazonSnapshots';
const MAX_HISTORY_PER_ASIN = 100;

async function getSnapshotMap() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || {};
}

async function saveSnapshot(snapshot) {
  if (!snapshot?.asin) {
    return { ok: false, error: 'Missing ASIN. Cannot save snapshot.' };
  }

  const map = await getSnapshotMap();
  const list = map[snapshot.asin] || [];
  list.push(snapshot);
  map[snapshot.asin] = list.slice(-MAX_HISTORY_PER_ASIN);
  await chrome.storage.local.set({ [STORAGE_KEY]: map });

  return { ok: true, count: map[snapshot.asin].length };
}

async function getSnapshots(asin) {
  const map = await getSnapshotMap();
  if (!asin) {
    return { ok: true, data: map };
  }

  return { ok: true, data: map[asin] || [] };
}

async function clearSnapshots(asin) {
  const map = await getSnapshotMap();

  if (asin) {
    delete map[asin];
  } else {
    Object.keys(map).forEach((key) => delete map[key]);
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: map });
  return { ok: true };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    if (message?.type === 'SAVE_SNAPSHOT') {
      sendResponse(await saveSnapshot(message.payload));
      return;
    }

    if (message?.type === 'GET_SNAPSHOTS') {
      sendResponse(await getSnapshots(message.asin));
      return;
    }

    if (message?.type === 'CLEAR_SNAPSHOTS') {
      sendResponse(await clearSnapshots(message.asin));
      return;
    }

    sendResponse({ ok: false, error: 'Unknown message type.' });
  })();

  return true;
});
