"use strict";

/*
 * Constants
 */
const mdn = /.*:\/\/developer\.mozilla\.org.*/;

/*
 * Event used to add the pageAction on MDN pages
 */
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (mdn.test(tab.url)) {
    browser.pageAction.show(tab.id);
  }
});

/*
 * Event used when the pageAction button is clicked
 */
browser.pageAction.onClicked.addListener(tab => {
  // TODO
});
