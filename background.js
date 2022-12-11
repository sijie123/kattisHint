try {
  importScripts('kattis.js'); // gives updateHints method
} catch (e) {
  console.error(e);
}

const HINT_SOURCE = "https://cpbook.net/methodstosolve?oj=kattis&topic=all&quality=all"

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // kattis.js requested the background thread to re-fetch hints
  if (message == "updateHints") {
    console.log("Background thread received request to update hints.")
    updateHints()
      .then(rawData => sendResponse(rawData));
    return true
  }
});

const save = (hints) => {
  cache = {
    "updated": Date.parse(new Date()),
    "data": hints
  }
  return chrome.storage.local.set(cache).then(() => {
    log.info(`Fetched and saved hints to Chrome cache.`)
  }).catch(err => {
    log.error(`Failed to save hints to Chrome cache. Error: ${err}`)
  }).then(() => {
    return cache
  })
}

const updateHints = () => {
  log.warn(`Re-initializing hint cache...`)
  return fetch(HINT_SOURCE)
    .then(rawRequest => rawRequest.text())
    .then((rawHints) => save(rawHints))
}

