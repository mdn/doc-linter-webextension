"use strict";

/*
 * Constants
 */
const editURL = /^https:\/\/developer\.mozilla\.org\/.+(?:\$(?:edit|translate)|\/docs\/new(?:\?|$))/;

/*
 * Load content scripts
 */
function loadTests() {
  return Promise.all([
    ...testList.map(test => browser.tabs.executeScript({file: `/tests/${test}`}))
  ]);
}

/*
 * Event used to add the pageAction on MDN pages
 */
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  loadTests();
  if (editURL.test(tab.url)) {
    browser.pageAction.show(tab.id);
  }
});

/*
 * Event used when the pageAction button is clicked
 */
browser.pageAction.onClicked.addListener(tab => {
  // TODO
});


