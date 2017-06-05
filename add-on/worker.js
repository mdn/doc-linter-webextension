/*
 * This file is the content script used to launch the tests
 * This script is loaded when the page load
 */

/*
 * Constants
 */
const RUN_TESTS_DELAY = 500;

const port = browser.runtime.connect(browser.runtime.id);
let runTestsTimeout = null;

/*
 * Run a specific test
 */
function runTest(testObj, id, rootElement) {
  // Only run the test suite if there's a root element
  // (e.g. when in source view there's no root element set)
  if (rootElement) {
    let contentTest = testObj.check(rootElement);
    testObj.errors = contentTest;
    port.postMessage({
      type: "processTestResult",
      test: testObj,
      id
    });
  }
}

/*
 * Run all the tests and send "finishedTests" when it's finishd
 */
function runTests() {
  let iframe = document.querySelector("iframe.cke_wysiwyg_frame");
  if (iframe) {
    let rootElement = iframe.contentDocument.body;
    // Currently contains an empty object coming from tests/doctests.js
    // TODO: Find why this Object is empty
    Object.keys(docTests).forEach(key => runTest(docTests[key], key, rootElement));
  }
  this.port.postMessage({type: "finishedTests"});
}

/*
 * Call the fix method for the target test
 */
function fixIssues(testObj, id) {
  // Only run the fixes if there's a root element
  // (e.g. when in source view there's no root element set)
  if (testObj.fix) {
    testObj.fix(testObj.errors);

    // Run test again to update its results
    let iframe = document.querySelector("iframe.cke_wysiwyg_frame");
    let rootElement = iframe.contentDocument.body;
    runTest(testObj, id, rootElement);
  }
}

/*
 * Events related
 */
port.onMessage.addListener(message => {
  switch (message.type) {
    case "processTestResult":
      // TODO:
      break;
    case "runTests":
      runTests();
      break;
    case "fixIssues":
      docTests.forEach((element, index) => fixIssues(element, index));
      break;
    default:
            // TODO:
      break;
  }
});

function initializeKeyEventHandler() {
  let iframe = document.querySelector("iframe.cke_wysiwyg_frame");
  iframe.contentWindow.addEventListener("keyup", () => (runTestsTimeout = window.setTimeout(runTests, RUN_TESTS_DELAY)));
  iframe.contentWindow.addEventListener("keydown", () => (window.clearTimeout(runTestsTimeout)));

  let ckeditor = document.getElementById("id_content");
  ckeditor.addEventListener("keyup", () => (runTestsTimeout = window.setTimeout(runTests, RUN_TESTS_DELAY)));
  ckeditor.addEventListener("keydown", () => (window.clearTimeout(runTestsTimeout)));
}

window.addEventListener("load", function injectIFrame() {
  window.removeEventListener("load", injectIFrame);

  // Using polling to add the spellchecking and initially run the tests,
  // because the iframe is not loaded immediately and there doesn't seem
  // to be a proper event to react to.
  let checkIfIframeLoadedInterval = setInterval(() => {
    let iframe = document.querySelector("iframe.cke_wysiwyg_frame");
    if (iframe) {
      clearInterval(checkIfIframeLoadedInterval);
      iframe.contentDocument.body.setAttribute("spellcheck", "true");
      runTests();
    }
  }, 50);
});

window.setTimeout(initializeKeyEventHandler, 1000);
