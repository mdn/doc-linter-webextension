/*
 * TODO: Understand how to replace require()
 */
// const {ERROR, WARNING, INFO} = require("../constants.js");

const ERROR = 1;
const WARNING = 2;
const INFO = 3;

let port;

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
  summary.style.display = "inline-block";
  errorList.classList.add("visible");
  warningList.classList.add("visible");
  infoList.classList.add("visible");
}

/*
 * Event listeners
 */

document.addEventListener("DOMContentLoaded", event => {
  // localization
  let elements = document.querySelectorAll("[data-i18n]");
  [].forEach.call(elements, element => {
    element.textContent = chrome.i18n.getMessage(element.dataset.i18n);
  });

  let fakeResults = [
    {name: "test", msg: "This is a test Error", type: ERROR},
    {name: "test", msg: "This is a second test Error", type: ERROR},
    {name: "test", msg: "This is a test Warning", type: WARNING},
    {name: "test", msg: "This is a test Info", type: INFO},
    {name: "test", msg: "This is a second test Warning", type: WARNING},
    {name: "test", msg: "This is a test second test Info", type: INFO}
  ];
  displayTestResults(fakeResults);
});

let fixIssues = document.getElementById("fixIssues");
fixIssues.addEventListener("onclick", event => {
  // TODO: Run the tests
});

browser.runtime.onConnect.addListener(port => {
  this.port = port;

  port.onMessage.addListener(message => {
    switch (message.type) {
      case "processTestResult":
        break;
    }
  });
});
