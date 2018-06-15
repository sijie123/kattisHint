function update() {
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
}

function parseScrape(html) {
  var dict = {}
  $(html).find("tr").each(function (entry) {
    if ($(this).hasClass("Kattis")) {
      var ctx = $(this)
      var scrape = ctx.text().split("\n")
      var info = [scrape[3].trim(), scrape[4].trim()]
      console.log(scrape[1])
      dict[scrape[1].trim()] = info
    } 
  })
  return dict;
}