chrome.storage.local.get(['cache', 'date'], function(result) {
  var oneMonthAgo = new Date();
  oneMonthAgo = oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  if (result[0] == "Fail" || result[1] < oneMonthAgo ) {
    update(function(success) {
      modifyPage();
    });
  }
  else {
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

function shortenCategory(cat) {
  var str = cat.split(",")[0].trim();
  if (str == "non-starred") return "N.S.";
  return str;
}
function modifyProblem(data, currentPage) {
  chrome.storage.local.get('data', function(result) {
    var data = JSON.parse(result['data'])
    if (data === undefined) return;
    if (data[currentPage]) {
      //Inject
      $(generateBox(data[currentPage][0], data[currentPage][1])).insertAfter($(".col-xs-3 > div").first())
    }
  });
}
function modifyListing(data) {
  $("<th colspan='1' class='nowrap'></th>").insertAfter($("thead > tr").first().find("th").eq(3)) //7th element, right before the submit button.
  $("<th class='nowrap'>Cat.</th>").insertAfter($("thead > tr").last().find("th").eq(7)) //7th element, right before the submit button.
  $("tr").filter(function(elem) {
    return $(this).hasClass("odd") || $(this).hasClass("even")
  }).each(function(idx) {
    var dom = $(this)
    var currentProblem = dom.find("a").first().attr('href').split("/")[2];
    if (!currentProblem) return;
    if (data[currentProblem]) {
      $("<td><a data-toggle='tooltip' data-placement='top' title='"+data[currentProblem][0]+"'>" + shortenCategory(data[currentProblem][0]) + "</a></td>").insertAfter($(this).find("td").eq(7));
    }
    else {
      $("<td>-</td>").insertAfter($(this).find("td").eq(7));
    }
  })
  $('[data-toggle="tooltip"]').tooltip()
  
}
function modifyPage() {
  chrome.storage.local.get('data', function(result) {
    var data = JSON.parse(result['data'])
    if (!data) return;
    var currentPage = window.location.pathname.split("/")[2];
    if (currentPage) {
      //Individual problem page
      modifyProblem(data, currentPage.trim());
    }
    else {
      //Main problem listing page
      modifyListing(data)
    }
  });

}