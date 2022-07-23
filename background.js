try {
  importScripts('kattis.js'); // gives updateHints method
} catch (e) {
  console.error(e);
}


chrome.runtime.onInstalled.addListener(() => {
  updateHints();
  chrome.alarms.get('periodic', alarm => {
    if (!alarm) chrome.alarms.create('periodic', { periodInMinutes: 60 * 24 * 30 }); // 30 days
  });
});

chrome.alarms.onAlarm.addListener(() => {
  updateHints();
});
