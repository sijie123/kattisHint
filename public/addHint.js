function generateBox(section, description) {
  return `
  <h2 style="margin-bottom:-2rem">CPBook Hint</h2>
  <div class="attribute_list-book attribute_list">
    <div class="attribute_list-item">
        <span class="attribute_list-label">Section</span>
        <span>${section}</span>
    </div>
    <div class="attribute_list-item">
        <span class="attribute_list-label">Description</span>
        <span>${description}</span>
    </div>
  </div>
  `;
}
function modifyProblem(data, currentPage) {
  if (data[currentPage]) {
    const hint = document.createRange().createContextualFragment(generateBox(data[currentPage].section, data[currentPage].description));
    document.querySelector(".attribute_list").parentElement.appendChild(hint);
  }
}
function modifyPage(data) {
  var currentPage = window.location.pathname.split("/")[2];
  if (currentPage) {
    //Individual problem page
    modifyProblem(data, currentPage.trim());
  }
}