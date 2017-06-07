/*
 *  Title: Test whether the API syntax headlines are named correctly, i.e. 'Parameters',
 *  'Return value' and 'Exceptions', and whether they appear in the correct order.
 *
 *  Example 1: The return value should have 'Return value' as headline and not 'Returns'.
 *
 *  Example 2: Exceptions should have 'Exceptions' as headline and not 'Errors' or 'Errors thrown'.
 *
 *  Example 3: Having an 'Exceptions' section before the 'Return value' section should be avoided.
 *  The correct order of the sections is 'Parameters', 'Return value' and 'Exceptions'.
 *
 *  Implementation notes: This test searches for specific keywords like 'returns' or 'errors' and
 *  expects the headlines to be <h3> elements under a <h2>Syntax</h2> section.
 */

const disallowedNames = new Map([["returns", "Return value"], ["errors", "Exceptions"],
    ["errors thrown", "Exceptions"]]);
const validOrder = [
  new Set(["parameters"]),
  new Set(["return value", "returns"]),
  new Set(["exceptions", "errors", "errors thrown"])
];

docTests.apiSyntaxHeadlines = {
  name: "api_syntax_headlines",
  desc: "api_syntax_headlines_desc",

  check: function checkAPISyntaxHeadlines(rootElement) {
    let headlines = rootElement.getElementsByTagName("h2");
    let syntaxSection = null;
    let order = [];
    let matches = [];
    for (let i = 0; !syntaxSection && i < headlines.length; i++) {
      if (headlines[i].textContent === "Syntax") {
        syntaxSection = headlines[i];
      }
    }

    if (syntaxSection) {
      let subHeadingElements = [];
      let element = syntaxSection.nextSibling;
      while (element && element.localName !== "h2") {
        if (element.localName === "h3") {
          subHeadingElements.push(element);
        }
        element = element.nextSibling;
      }
      for (let i = 0; i < subHeadingElements.length; i++) {
        let subHeading = subHeadingElements[i].textContent.toLowerCase();
        for (let j = 0; j < validOrder.length; j++) {
          let heading = validOrder[j];
          if (heading.has(subHeading)) {
            order.push(j);
          }
        }
        if (disallowedNames.has(subHeading)) {
          matches.push({
            node: subHeadingElements[i],
            msg: "invalid_headline_name",
            msgParams: [subHeadingElements[i].textContent],
            type: ERROR
          });
        }
      }

      // Check the order of the headlines
      for (let i = 1; i < order.length; i++) {
        if (order[i] < order[i - 1]) {
          matches.push({
            msg: "invalid_headline_order",
            type: ERROR
          });
        }
      }
    }

    return matches;
  },

  fix: function fixAPISyntaxHeadlines(matches) {
    matches.forEach(match => {
      switch (match.msg) {
        case "invalid_headline_name":
          match.node.textContent = disallowedNames.get(match.node.textContent.toLowerCase());
          break;
      }
    });
  }
};
