import {update} from "./data.js";


chrome.runtime.onInstalled.addListener(() => {
  update(() => { console.log("Gathered data!") });
  console.log("Installed");
});