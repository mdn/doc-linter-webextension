const ERROR = 1;
const WARNING = 2;
const INFO = 3;

let port;

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
  this.port.postMessage({type: "runTests"});
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

  /*
   * TODO: tests.classList.toggle("hidePassingTests", prefs.hidePassingTests)
   * Add preferences and convert to webExtensions
   */
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
 * Helper to create an element for the lists
 * (https://github.com/Elchi3/mdn-doc-tests/blob/master/data/sidebar.js#L79)
 * error looks like {node: Node, msg: String, type: number}
 */
function generateEntry(error, id) {
  let testContainer = document.createElement("li");
  let errorClass;
  switch (error.type) {
    case WARNING:
      errorClass = "warning";
      break;
    case ERROR:
      errorClass = "error";
      break;
    default:
      errorClass = "info";
  }
  testContainer.setAttribute("class", `test ${errorClass}`);
  testContainer.setAttribute("id", id);

  /*
    SRC : https://github.com/Elchi3/mdn-doc-tests/blob/master/data/sidebar.js#L42
    TODO: ask @fscholz Why is it there
    testContainer.dataset.errorCount = newErrorCount;
    testContainer.dataset.warningCount = newWarningCount;
    */
  testContainer.textContent = error.msg;

  let testHeadingContainer = document.createElement("div");
  testHeadingContainer.setAttribute("class", "testHeading");

  let testHeading = document.createElement("span");
  testHeading.setAttribute("class", "testName");
  testHeading.textContent = error.name;

  testHeadingContainer.appendChild(testHeading);

  let errorCounter = document.createElement("span");
  errorCounter.setAttribute("class", "errorCount");
  // TODO replace the fixed value by a relevant value
  errorCounter.textContent = "0";
  testHeadingContainer.appendChild(errorCounter);
  testContainer.appendChild(testHeadingContainer);

  return testContainer;
}

/*
 * Fill the HTML lists with the errors and make it visible
 */
/*
function displayTestResults(results) {
  let errors = [];
  let warnings = [];
  let infos = [];

  results.forEach(element => {
    switch (element.type) {
      case ERROR:
        errors.push(element);
        break;
      case WARNING:
        warnings.push(element);
        break;
      case INFO:
        infos.push(element);
        break;
    }
  });

  let errorCounter = document.getElementById("totalErrorCount");
  let warningCounter = document.getElementById("totalWarningCount");
  errorCounter.textContent = errors.length;
  warningCounter.textContent = warnings.length;
  errorCounter.classList.add("error");
  warningCounter.classList.add("warning");

  let errorList = document.getElementById("tests-errors");
  let warningList = document.getElementById("tests-warnings");
  let infoList = document.getElementById("tests-infos");

  errors.forEach(element => errorList.appendChild(generateEntry(element)));
  warnings.forEach(element => warningList.appendChild(generateEntry(element)));
  infos.forEach(element => infoList.appendChild(generateEntry(element)));

  let summary = document.getElementById("summary");
  summary.style.display = "flex";
  errorList.classList.add("visible");
  warningList.classList.add("visible");
  infoList.classList.add("visible");
}
*/

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
  testObj.name = browser.i18n.getMessage(testObj.name);
  testObj.desc = browser.i18n.getMessage(testObj.desc);

  testObj.errors.forEach((error, index, errors) => {
    errors[index] = {
      msg: [error.msg].concat(error.msgParams),
      type: error.type
    };
  });

  //document.getElementById("testProgress").value += Math.round(100 / testList.length);

  showTestResult(testObj, id);
}

browser.runtime.onConnect.addListener(port => {
  this.port = port;

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
