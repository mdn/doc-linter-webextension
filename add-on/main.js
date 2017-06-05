"use strict";

/*
 * Constants
 */
const editURL = /^https:\/\/developer\.mozilla\.org\/.+(?:\$(?:edit|translate)|\/docs\/new(?:\?|$))/;
// TODO: Ask @fscholz or @jwhitlock if it's still possible to edit template on MDN or if it's no longer relevant
// const templateURL= /^https:\/\/developer\.mozilla\.org\/.+?\/docs\/(?:templates|Template(?::|%3A))/;

/*
 * Load content scripts
 */
//function loadTests() {
//  // Absolute path are used to be compatible with Chrome and Webkit based browser
//  return browser.tabs.executeScript({file: "/tests/doctests.js"}).then(() => {
//    return browser.tabs.executeScript({file: "/tests/testlist.js"}).then(() => {
//      return Promise.all([
//        ...testList.map(test => browser.tabs.executeScript({file: `/tests/${test}`}))
//      ]).catch(() => {/* TODO: Proper error management */});
//    }).catch(() => {/* TODO: Proper error management */});
// }).catch(() => {
//    // TODO: Find what the proper error management is for this case
//  });
//}

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


