/*
 *  Title: Test for whether the 'syntax' class is properly used on a syntax block.
 *
 *  Example 1: <pre> elements following a 'Formal syntax' heading are expected to contain a syntax
 *  definition, which needs to be styled using class="syntaxbox".
 *
 *  Example 2: <pre> elements following a 'Syntax' heading where there is no 'Formal syntax'
 *  section are expected to contain a syntax definition, which needs to be styled using
 *  class="syntaxbox".
 *
 *  Implementation notes: This test first searches for an <h3>Formal syntax</h3> heading. If none
 *  is found, it searches for a <h2>Syntax</h2> heading. If one of those is found, the following
 *  <pre> element is expected to hold a syntax definition, which needs to be styled using
 *  class="syntaxbox".
 */

docTests.wrongSyntaxClass = {
  name: "wrong_syntax_class",
  desc: "wrong_syntax_class_desc",
  check: function checkWrongSyntaxClass(rootElement) {
    function checkPre(heading) {
      let element = heading.nextSibling;
      while (element && element.localName !== "h2") {
        if (element.localName === "pre" && element.className !== "syntaxbox") {
          return {
            node: element,
            msg: "wrong_syntax_class_used",
            msgParams: [element.className],
            type: ERROR
          };
        }
        element = element.nextElementSibling;
      }
      return undefined;
    }

    let subHeadings = rootElement.getElementsByTagName("h3");
    let formalSyntaxSection = null;
    for (let i = 0; !formalSyntaxSection && i < subHeadings.length; i++) {
      if (subHeadings[i].textContent.match(/Formal syntax/i)) {
        formalSyntaxSection = subHeadings[i];
      }
    }

    let matches = [];
    if (formalSyntaxSection) {
      let match = checkPre(formalSyntaxSection);
      if (match) {
        matches.push(match);
      }
    } else {
      let headings = rootElement.getElementsByTagName("h2");
      let syntaxSection = null;
      for (let i = 0; !syntaxSection && i < headings.length; i++) {
        if (headings[i].textContent.toLowerCase() === "syntax") {
          syntaxSection = headings[i];
        }
      }

      if (syntaxSection) {
        let match = checkPre(syntaxSection);
        if (match) {
          matches.push(match);
        }
      }
    }

    return matches;
  },
  fix: function fixWrongSyntaxClass(matches) {
    matches.forEach(match => {
      match.node.className = "syntaxbox";
    });
  }
};
