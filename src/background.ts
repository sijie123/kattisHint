chrome.runtime.onInstalled.addListener(() => {
  fetchRawData();
});

function fetchRawData() {
  fetch("https://cpbook.net/methodstosolve")
    .then(response => {
      return response.text();
    })
    .then(response => {
      chrome.storage.local.set({ rawData: response }, function () {
        console.log("Synced data from methodstosolve.");
      });
    }).catch(err => {
      console.log(err);
    });
}