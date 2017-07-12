"use strict";

/*
 * Constants
 */
const editURL = /^https:\/\/developer\.mozilla\.org\/.+(?:\$(?:edit|translate)|\/docs\/new(?:\?|$))/;

/*
 * Load content scripts
 */
function loadTests() {
  return browser.tabs.executeScript({file: '/rules.js'});
}

/*
 * Event triggered each time the page is updated
 */
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  loadTests();
});

