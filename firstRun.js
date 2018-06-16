chrome.runtime.onInstalled.addListener(function() {
  update(callback);
});

function callback() {
  console.log("Init success.")
}