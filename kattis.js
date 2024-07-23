const write = (sev, data) => console.log(`${new Date()} [${sev}] Kattis Hint Giver: ${data}`);

const log = {
  info: (data) => write("INFO", data),
  warn: (data) => write("WARN", data),
  error: (data) => write("ERROR", data)
}

const toDOM = (htmlString) => {
  const template = document.createElement('template');
  template.innerHTML = htmlString.trim();
  return template.content.firstChild;
}

const insertAfter = (referenceNode, newNode) => referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)

const parse = (html) => {
  let results = {};
  new DOMParser()
    .parseFromString(html, "text/html")
    .querySelectorAll(".Kattis")
    .forEach((hint) => {
      const title = hint.children[0].innerText;
      const category = hint.children[2].innerText;
      const fullHint = hint.children[3].innerText;
      results[title] = {
        "category": category,
        "fullHint": fullHint
      }
    })
  log.info(`Loaded ${Object.keys(results).length} items from methodstosolve.`)
  return results;
}

const readCache = () => {
  let oneMonthAgo = new Date();
  oneMonthAgo = oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  return chrome.storage.local.get({
    'updated': 0,
    'data': null
  }).then(cache => {
    if (!cache["updated"]) {
      throw new Error("Hint cache not found or not usable.")
    }
    log.info(`Cache found. Last updated: ${cache["updated"]}. Must not be older than: ${oneMonthAgo}`)
    if (cache["updated"] < oneMonthAgo) {
      throw new Error("Hint cache outdated.")
    }
    return cache
  })
}

const checkHints = () => {
  return readCache()
    .then(hint => {
      log.info("Hint cache is up to date.")
      return hint
    })
    .catch((ex) => {
      log.warn(`Caught exception while checking hints: ${ex}... Refreshing hint cache.`)
      return requestHintUpdate()
    }) 
}

const requestHintUpdate = () => {
  return chrome.runtime.sendMessage('updateHints')
    .then((response) => {
      console.log("Receive updated hint cache HTML:", response);
      console.log("Re-loading cache...");
      return readCache()
    })
};

const drawListing = (hints) => {
  console.log("Drawing on listing")
  const tableHeader = `<th>Category</th>`

  insertAfter(document.querySelector("section .table2 > thead > tr > th:nth-last-child(3)"), toDOM(tableHeader))

  document.querySelectorAll(".table2 > tbody > tr").forEach((row) => {
    const problem = row.querySelector("td:nth-of-type(1) > a").getAttribute("href").split("/")[2];
    const hint = hints[problem]
    let cellData = `<td></td>`

    if (hint) {
      cellData = `<td>${hint["category"]}</td>`
    } 
    insertAfter(row.querySelector("td:nth-last-of-type(3)"), toDOM(cellData))
  })
}

const drawProblem = (hints, problem) => {
  console.log("Drawing on problem")
  const hint = hints[problem]
  const category = hint ? hint["category"] : "Not Available"
  const fullHint = hint ? `
  <details class="spoiler" style="--hidden: '${hint["fullHint"]}'">
    <summary>Show Spoiler</summary>
    <div>${hint["fullHint"]}</div>
  </details>
  ` : "Not Available"
  const tableCategory = `
    <div class="card">
      <div class="flex flex-col gap-3">
        <span class="info_label">Category</span>
        <span class="flex gap-3">
        ${category}
        </span>
      </div>
    </div>
  `
  const tableFullHint = `
    <div class="card">
      <div class="flex flex-col gap-3">
        <span class="info_label">Hint</span>
        <span class="flex gap-3">
        ${fullHint}
        </span>
      </div>
    </div>
  `

  insertAfter(document.querySelector("#editor-container #metadata-tab > div:last-child"), toDOM(tableCategory))
  insertAfter(document.querySelector("#editor-container #metadata-tab > div:last-child"), toDOM(tableFullHint))
}

const drawHints = (hints) => {
  // If we're here, we can be sure we're on *.kattis.com on an actual window
  // so window.location will exist.
  const pagePath = window.location.pathname.split("/")
  if (pagePath.length === 2 && pagePath[1] === "problems") {
    // Assume that we are on main problem listing page: https://*.kattis.com/problems
    drawListing(hints)

  } else if (pagePath.length === 3 && pagePath[1] === "problems") {
    // Assume that we are on an individual problem page: https://*.kattis.com/problems/10kindsofpeople
    const problem = pagePath[2]
    drawProblem(hints, problem)
  }
  // Else... I don't know where I am! Let's not destroy the UI.
}

// Trying to re-use code here but Chrome makes it hard to do so across
// background service-worker vs when on *.kattis.com
// Thus, using window !== undefined to judge whether the page is running
// on background service worker vs actual window.
if (typeof window !== "undefined") {
  checkHints()
    .then(cache => parse(cache["data"]))
    .then(hints => drawHints(hints))
}