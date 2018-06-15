
chrome.runtime.onInstalled.addListener(function() {
  let dataSourceURL = "https://cpbook.net/methodstosolve"
  $.ajax({
    type: "GET",
    url: dataSourceURL,
    success: function(scrapeData) {
      //console.log(scrapeData)
      var cacheData = JSON.stringify(parseScrape(scrapeData))
      chrome.storage.local.set({cache: "OK", date: new Date(), data: cacheData}, function() {
        console.log("Synced data from methodstosolve.");
      });
    },
    error: function(err) {
      console.log(err);
      chrome.storage.local.set({cache: "Fail", date: new Date()}, function() {
        console.log("Failed to sync data.");
      });
    }
  });
});
