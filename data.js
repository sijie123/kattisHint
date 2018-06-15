/*chrome.storage.local.set({key: value}, function() {
  console.log('Value is set to ' + value);
});

chrome.storage.local.get(['key'], function(result) {
  console.log('Value currently is ' + result.key);
});
*/
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