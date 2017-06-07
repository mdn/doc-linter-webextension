/*
 *  Title: Test for example headings starting with 'Example:'.
 *
 *  Example 1: <h3>Example: Simple example</h3> should rather be written as <h3>Simple example</h3>
 *
 *  Implementation notes: This test checks whether the text of heading elements start with
 *  'Example:'.
 */

const reExample = /^\s*Example:[\s_]*/;

docTests.exampleColonHeading = {
  name: "example_headings",
  desc: "example_headings_desc",

  check: function checkExampleColonHeading(rootElement) {
    let headlines = rootElement.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let matches = [];

    for (let i = 0; i < headlines.length; i++) {
      if (headlines[i].textContent.match(reExample)) {
        matches.push({
          node: headlines[i],
          msg: headlines[i].outerHTML,
          type: ERROR
        });
      }
    }

    return matches;
  },

  fix: function fixExampleColonHeading(matches) {
    matches.forEach(match => {
      match.node.textContent = match.node.textContent.replace(reExample, "");
      let id = match.node.getAttribute("id");
      id = id.replace(reExample, "");
      match.node.setAttribute("id", id);
    });
  }
};
