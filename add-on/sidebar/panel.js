const ERROR = 1;
const WARNING = 2;
const INFO = 3;

// eslint-disable-next-line no-unused-vars
const port = browser.runtime.connect({name: "sidebar"});

/*
 * Global variables
 */
let totalErrorCount = 0;
let totalWarningCount = 0;

/*
 * Update the error summary and make it visible if it's not already
 */
function updateErrorSummary() {
  // Show summary
  document.getElementById("summary").style.display = "flex";

  let totalErrorCounter = document.getElementById("totalErrorCount");
  totalErrorCounter.textContent = totalErrorCount;
  if (totalErrorCount === 0) {
    totalErrorCounter.classList.remove("hasErrors");
    totalErrorCounter.classList.add("ok");
  } else {
    totalErrorCounter.classList.remove("ok");
    totalErrorCounter.classList.add("hasErrors");
  }

  let totalWarningCounter = document.getElementById("totalWarningCount");
  totalWarningCounter.textContent = totalWarningCount;
  if (totalWarningCount === 0) {
    totalWarningCounter.classList.remove("hasWarnings");
    totalWarningCounter.classList.add("ok");
  } else {
    totalWarningCounter.classList.remove("ok");
    totalWarningCounter.classList.add("hasWarnings");
  }
}

/*
 * Make the progressBar visible and start the tests
 */
function runTests() {
  let progressBar = document.getElementById("testProgress");
  progressBar.value = 0;
  progressBar.classList.add("visible");
  port.postMessage({type: "runTests"});
}

/*
 * Get the status based on test.errors results
 */
function getStatus(errors) {
  if (errors.some(match => match.type === ERROR)) {
    return "hasErrors";
  } else if (errors.some(match => match.type === WARNING)) {
    return "hasWarnings";
  } else if (errors.every(match => match.type === INFO)) {
    return "hasInfo";
  }

  return "ok";
}

/*
 * Show the result of test
 */
function showTestResult(test, id) {
  let tests = document.getElementById("tests");
  let matchesCount = test.errors.length;
  let status = "ok";

  if (matchesCount !== 0) {status = getStatus(test.errors);}

  let oldWarningCount = 0;
  let oldErrorCount = 0;
  let newWarningCount = test.errors.filter(match => match.type === WARNING).length;
  let newErrorCount = test.errors.filter(match => match.type === ERROR).length;

  if(localStorage.getItem("hide_passing_tests") === "true") {
    tests.classList.toggle("hidePassingTests", true);
  } else {
    if(tests.classList.contains("hidePassingTests")) tests.classList.remove("hidePassingTests");
  }

  let testElem = document.getElementById(id);
  if (tests.contains(testElem)) {
    oldWarningCount = Number(testElem.dataset.warningCount);
    oldErrorCount = Number(testElem.dataset.errorCount);
    testElem.dataset.errorCount = newErrorCount;
    testElem.dataset.warningCount = newWarningCount;
    testElem.getElementsByClassName("errorCount")[0].textContent = matchesCount;
    testElem.classList.remove("hasErrors", "hasWarnings", "hasInfo", "ok");
    testElem.classList.add(status);
  } else {
    let testContainer = document.createElement("li");
    testContainer.setAttribute("class", `test ${status}`);
    testContainer.setAttribute("id", id);
    testContainer.setAttribute("title", test.desc);
    testContainer.dataset.errorCount = newErrorCount;
    testContainer.dataset.warningCount = newWarningCount;
    let testHeadingContainer = document.createElement("div");
    testHeadingContainer.setAttribute("class", "testHeading");
    let testHeading = document.createElement("span");
    testHeading.setAttribute("class", "testName");
    testHeading.textContent = test.name;
    testHeadingContainer.appendChild(testHeading);
    let errorCounter = document.createElement("span");
    errorCounter.setAttribute("class", "errorCount");
    errorCounter.textContent = matchesCount;
    testHeadingContainer.appendChild(errorCounter);
    testContainer.appendChild(testHeadingContainer);

    let errorList = document.createElement("ul");
    errorList.setAttribute("class", "errors");
    testContainer.appendChild(errorList);

    tests.appendChild(testContainer);

    testElem = document.getElementById(id);

    /*
     * TODO: Add preferences and convert to webExtensions
     * if (prefs.autoExpandErrors && status !== "ok") {
     * testElem.getElementsByClassName("errors")[0].classList.add("show");
     * }
     */

    document.getElementById("fixIssues").classList.add("show");
  }

  let errors = testElem.getElementsByClassName("errors")[0];
  if (status === "ok") {
    errors.classList.remove("show");
  }
  while (errors.firstChild) {
    errors.removeChild(errors.firstChild);
  }
  test.errors.forEach(error => {
    let errorContainer = document.createElement("li");
    let errorClass = "error";
    switch (error.type) {
      case WARNING:
        errorClass = "warning";
        break;
      case INFO:
        errorClass = "info";
        break;
    }
    errorContainer.setAttribute("class", errorClass);
    errorContainer.textContent = error.msg;
    errors.appendChild(errorContainer);
  });

  totalWarningCount += newWarningCount - oldWarningCount;
  totalErrorCount += newErrorCount - oldErrorCount;

  updateErrorSummary();
}

/*
 * Event listeners
 */

document.addEventListener("DOMContentLoaded", event => {
  // localization
  let elements = document.querySelectorAll("[data-i18n]");
  [].forEach.call(elements, element => {
    element.textContent = browser.i18n.getMessage(element.dataset.i18n);
  });
});

/*
 * Process the result from the test.
 */
function processTestResult(testObj, id) {
  // TODO: Follow https://bugzilla.mozilla.org/show_bug.cgi?id=1370884
  let test = JSON.parse(testObj);
  test.name = browser.i18n.getMessage(test.name);
  test.desc = browser.i18n.getMessage(test.desc);

  test.errors.forEach((error, index, errors) => {
    errors[index] = {
      msg: [error.msg].concat(error.msgParams),
      type: error.type
    };
  });

  // document.getElementById("testProgress").value += Math.round(100 / testList.length);

  showTestResult(test, id);
}

port.onMessage.addListener(message => {
  switch (message.type) {
    case "showTestResult":
      showTestResult(message.test, message.id);
      break;
    case "updateProgress":
      document.getElementById("testProgress").value += message.progress;
      break;
    case "hideProgressBar":
    case "finishedTests":
      document.getElementById("testProgress").classList.remove("visible");
      break;
    case "processTestResult":
      processTestResult(message.test, message.id);
      break;
  }
});

/*
 * Load the preferences from localStorage and pre-fill the panel with the relevant preferences.
 */
function loadPreferences() {
  if(localStorage.getItem("hide_passing_tests") == true) {
    document.getElementById("passingTests").checked = true;
  }
}

/*
 * Bind the event on preferences buttons when the DOM is loaded
 */
window.addEventListener("DOMContentLoaded", function switchPanelHandler() {
  loadPreferences();

  // Preferences storage
  document.getElementById("passingTests").addEventListener("change", (event) => localStorage.setItem("hide_passing_tests", event.target.checked));
});

window.addEventListener("DOMContentLoaded", function loadTestSuite() {
  function getParentByClassName(node, className) {
    let currentNode = node;

    while (currentNode && (!currentNode.classList || !currentNode.classList.contains(className))) {
      currentNode = currentNode.parentNode;
    }

    return currentNode;
  }

  window.removeEventListener("DOMContentLoaded", loadTestSuite);

  document.addEventListener("contextmenu", function blockContextMenu(event) {
    event.preventDefault();
  });

  document.getElementById("btn-runtests").addEventListener("click", event => runTests());
  document.getElementById("fixIssues").addEventListener("click", event => this.port.postMessage({type: "fixIssues"}));

  let tests = document.getElementById("tests");
  tests.addEventListener("click", evt => {
    let testHeading = getParentByClassName(evt.originalTarget, "testHeading");
    if (testHeading) {
      let testElem = getParentByClassName(testHeading, "test");
      if (!testElem.classList.contains("ok")) {
        testElem.getElementsByClassName("errors")[0].classList.toggle("show");
      }
    }
  });
});
