function update(callback) {
  let dataSourceURL = "https://cpbook.net/methodstosolve"
  $.ajax({
    type: "GET",
    url: dataSourceURL,
    success: function(scrapeData) {
      var cacheData = JSON.stringify(parseScrape(scrapeData))
      chrome.storage.local.set({cache: "OK", date: new Date(), data: cacheData}, function() {
        console.log("Synced data from methodstosolve.");
        callback();
      });
    },
    error: function(err) {
      console.log(err);
      chrome.storage.local.set({cache: "Fail", date: new Date()}, function() {
        console.log("Failed to sync data.");
        callback();
      });
    }
  });
}

function parseScrape(html) {
  var dict = {}
  var count = 0;
  $(html).find("tr").each(function (entry) {
    if ($(this).hasClass("Kattis")) {
      var ctx = $(this)
      var scrape = ctx.text().split("\n")
      var info = [scrape[3].trim(), scrape[4].trim()]
      dict[scrape[1].trim()] = info
      count++;
    } 
  })
  console.log("Kattis Hint Giver: Loaded " + count + " items from methodstosolve.")
  return dict;
}