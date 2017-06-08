/*
 * This background script act as a proxy between the sidebar and the content_script
 */

let worker;
let sidebar;

browser.runtime.onConnect.addListener(port => {
  switch (port.name) {
    case "sidebar":
      sidebar = port;
      sidebar.onMessage.addListener(message => worker.postMessage(message));
      break;
    case "worker":
      worker = port;
      worker.onMessage.addListener(message => sidebar.postMessage(message));
      break;
  }
});
