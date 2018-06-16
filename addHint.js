chrome.storage.local.get(['cache', 'date'], function(result) {
  var oneMonthAgo = new Date();
  oneMonthAgo = oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  if (result[0] == "Fail" || result[1] < oneMonthAgo ) {
    update(function(success) {
      modifyPage();
    });
  }
  else {
    console.log("Everything is fine");
    modifyPage();
  }
});
function generateBox(cat, hint) {
  return "<div class='page-content single clearfix' style='margin-top: -15px'>\
  <section class='box clearfix main-content problem-sidebar' style='padding: 5px 15px'>\
    <div class='sidebar-info'>\
      <p>\
        <strong>Category: </strong>" + cat + "\
      </p>\
      <p>\
        <strong>Hint: </strong>" + hint + "\
      </p>\
    </div>\
  </section>\
</div>"
}
function modifyPage() {
  var currentPage = window.location.pathname;
  currentPage = currentPage.split("/")[2].trim();
  chrome.storage.local.get('data', function(result) {
    var data = JSON.parse(result['data'])
    if (data === undefined) return;
    if (data[currentPage]) {
      //Inject
      $(generateBox(data[currentPage][0], data[currentPage][1])).insertAfter($(".col-xs-3 > div").first())
    }
  });
}