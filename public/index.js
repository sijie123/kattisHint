const loadAndProcessRawData = () => {
  chrome.storage.local.get('rawData').then(res => {
    if (!res.rawData) {
      console.log("Could't find rawData in local storage.");
      return;
    }
    console.log("Processing raw data...");

    const parser = new DOMParser();
    const doc = parser.parseFromString(res.rawData, "text/html");
    const kattisProblems = doc.querySelectorAll(".Kattis");
    const data = {};
    for (const kattisProblem of kattisProblems) {
      data[kattisProblem.children[0].innerText] = {
        section: kattisProblem.children[2].innerText,
        description: kattisProblem.children[3].innerText
      }
    }

    chrome.storage.local.set({ data }).then(res => {
      console.log("Successfully stored data in local storage");
      loadDataFromStorage();
    }).catch(err => {
      console.log(`Could't store data in local storage: ${err}`);
    });
  });
};

const loadDataFromStorage = () => {
  chrome.storage.local.get('data')
    .then(res => {
      if (!res.data) {
        console.log("Found no stored data");
        loadAndProcessRawData();
        return;
      }
      console.log("Using stored data");

      modifyPage(res.data);
    });
};

loadDataFromStorage();