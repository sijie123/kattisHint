function parseScrape(html) {
  var dict = {}
  var count = 0;

  console.log(html);

  /*
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
  */
  return dict;
}

export default function (callback) {
  fetch("https://cpbook.net/methodstosolve")
    .then(response => {
      return response.text();
    })
    .then(response => {
      const cacheData = JSON.stringify(parseScrape(response))
      chrome.storage.local.set({ cache: "OK", date: new Date(), data: cacheData }, function () {
        console.log("Synced data from methodstosolve.");
        callback();
      });
    }).catch(err => {
      console.log(err);
      chrome.storage.local.set({ cache: "Fail", date: new Date() }, function () {
        console.log("Failed to sync data.");
        callback();
      });
    });
}