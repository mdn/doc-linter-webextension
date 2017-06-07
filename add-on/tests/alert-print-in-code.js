/*
 *  Title: Test whether discouraged statements are used in example code.
 *
 *  Example 1: <pre>alert("Some message");</pre> should be avoided and
 *  <pre>console.log("Some message");</pre> be used instead.
 *
 *  Implementation notes: This test checks all <pre> blocks for the usage of discouraged functions.
 *  In some cases their usage may not be avoided, like for example on their description pages.
 *  The test does not account for those cases, though.
 */

docTests.alertPrintInCode = {
  name: "alert_print_in_code",
  desc: "alert_print_in_code_desc",
  check: function checkAlertPrintInCode(rootElement) {
    let pres = rootElement.getElementsByTagName("pre");
    let matches = [];
    for (let i = 0; i < pres.length; i++) {
      let preMatches = pres[i].textContent.match(/(?:alert|print|eval|document\.write)\s*\((?:.|\n)+?\)/gi) || [];
      matches = matches.concat(mapMatches(preMatches, ERROR));
    }

    return matches;
  }
};
