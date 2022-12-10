const HINT_SOURCE = "https://cpbook.net/methodstosolve?oj=kattis&topic=all&quality=all"

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

const save = (hints) => {
  chrome.storage.local.set({
    "updated": Date.parse(new Date()),
    "data": hints
  }).then(() => {
    log.info(`Fetched and saved hints to Chrome cache.`)
  }).catch(err => {
    log.error(`Failed to save hints to Chrome cache. Error: ${err}`)
  }).then(() => {
    return hints
  })
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

const updateHints = () => {
  return readCache()
    .then(hint => {
      log.info("Hint cache is up to date.")
      return hint
    })
    .catch((ex) => {
      log.warn(`${ex} Re-initializing hint cache...`)
      return fetch(HINT_SOURCE)
        .then(rawRequest => rawRequest.text())
        .then((rawHints) => save(rawHints))
    })     
}

const drawListing = (hints) => {
  console.log("Drawing on listing")
  const tableHeader = `
  <th class="table-item-autofit">
    <a href="#">Category</a>
  </th>
  `
  insertAfter(document.querySelector(".table2 > thead > tr :nth-last-child(3)"), toDOM(tableHeader))

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
    <div class="metadata_list-item">
      <span class="metadata_list-label">Category</span>
      <span>
        ${category}
      </span>
    </div>
  `
  const tableFullHint = `
    <div class="metadata_list-item">
      <span class="metadata_list-label">Hint</span>
      <span style="max-width: 70%; text-align: right;">
      ${fullHint}
      </span>
    </div>
  `

  insertAfter(document.querySelector("#editor-container .metadata_list > .metadata_list-item:last-child"), toDOM(tableCategory))
  insertAfter(document.querySelector("#editor-container .metadata_list > .metadata_list-item:last-child"), toDOM(tableFullHint))
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
  readCache()
    .then(cache => parse(cache["data"]))
    .then(hints => drawHints(hints))
}