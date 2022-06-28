import update from "./data.js";

addEventListener('install', event => { });

oninstall = event => {
  update(() => { console.log("Gathered data!") });
  console.log("Installed");
}