/*
 * This file is the content script used to launch the tests
 * This script is loaded when the page load
 */

/*
 * Constants
 */
const RUN_TESTS_DELAY = 500;

const port = browser.runtime.connect({name: "worker"});
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
      test: JSON.stringify(testObj),
      id
    });
  }
}

/*
 * Run all the tests and send "finishedTests" when it's finishd
 */
function runTests() {
  let iframe = document.querySelector("iframe.cke_wysiwyg_frame");
  let sourceTextarea = document.querySelector("textarea.cke_source");

  if (iframe) {
    let rootElement = iframe.contentDocument.body;
    Object.entries(linter).forEach((element, index) => runTest(linter[element[0]], element[0], rootElement));
  }

  if(sourceTextarea) {
    console.log("Textarea : running tests triggered");
    let rootElement = document.createElement("body");
    rootElement.innerHTML = sourceTextarea.value;
    Object.entries(linter).forEach((element, index) => runTest(linter[element[0]], element[0], rootElement));
  }

  port.postMessage({type: "finishedTests"});
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
    case "runTests":
      runTests();
      break;
    case "fixIssues":
      docTests.forEach((element, index) => fixIssues(element, index));
      break;
  }
});

/*
 * Run the tests suits when there is content change in CKEditor
 */
function initializeKeyEventHandler() {
  let iframe = document.querySelector("iframe.cke_wysiwyg_frame");
  if(iframe) {
    iframe.contentWindow.addEventListener("keyup", () => (runTestsTimeout = window.setTimeout(runTests, RUN_TESTS_DELAY)));
    iframe.contentWindow.addEventListener("keydown", () => (window.clearTimeout(runTestsTimeout)));
  }

  let ckeditor = document.getElementById("id_content");
  if(ckeditor) {
    ckeditor.addEventListener("keyup", () => (runTestsTimeout = window.setTimeout(runTests, RUN_TESTS_DELAY)));
    ckeditor.addEventListener("keydown", () => (window.clearTimeout(runTestsTimeout)));
  }

  let sourceTextarea = document.querySelector("textarea.cke_source");
  if(sourceTextarea) {
    sourceTextarea.addEventListener("keyup", () => (runTestsTimeout = window.setTimeout(runTests, RUN_TESTS_DELAY)));
    sourceTextarea.addEventListener("keydown", () => (window.clearTimeout(runTestsTimeout)));
  }
}

/*
 * Enable spellchecking in CKEditor
 */
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

/*
 * Bind the "Source mode" button to put the eventListener as they are removed when switching in source mode.
 */
function sourceModeSwitchEventHandler() {
  let sourceSwitch = document.querySelector("#cke_14");
  sourceSwitch.addEventListener("click", () => {
    window.setTimeout(initializeKeyEventHandler, 1000);
  });
}

window.setTimeout(sourceModeSwitchEventHandler, 1000);
