/*
 *  Title: Test for sidebar macros that are not wrapped in <div> elements
 *
 *  Example 1: <p>{{APIRef}}</p> should be replaced by <div>{{APIRef}}</div>.
 *
 *  Implementation notes: This test checks whether some named macros are wrapped in other elements
 *  than <div>s.
 */

docTests.incorrectlyWrappedSidebarMacros = {
  name: "incorrectly_wrapped_sidebar_macros",
  desc: "incorrectly_wrapped_sidebar_macros_desc",

  check: function checkIncorrectlyWrappedSidebarMacros(rootElement) {
    const allowedMacros = /^(?:apiref|cssref|htmlref|jsref|makesimplequicklinks|mathmlref|svgrefelem)$|sidebar$/i;

    let treeWalker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_TEXT,
        // eslint-disable-next-line
      {acceptNode: node => node.textContent.match(/\{\{.*?\}\}/) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT}
    );
    let matches = [];

    while (treeWalker.nextNode()) {
      let reMacroName = /\{\{\s*([^(}\s]+).*?\}\}/g;
      let macroNameMatch = reMacroName.exec(treeWalker.currentNode.textContent);
      while (macroNameMatch) {
        if (macroNameMatch[1].match(allowedMacros) !== null &&
            treeWalker.currentNode.parentElement.localName !== "div") {
          matches.push({
            node: treeWalker.currentNode.parentElement,
            msg: "wrong_element_wrapping_sidebar_macro",
            msgParams: [macroNameMatch[0], treeWalker.currentNode.parentElement.localName],
            type: ERROR
          });
        }
        macroNameMatch = reMacroName.exec(treeWalker.currentNode.textContent);
      }
    }

    return matches;
  },

  fix: function fixIncorrectlyWrappedSidebarMacros(matches) {
    matches.forEach(match => {
      let divElement = document.createElement("div");
      let childNodes = match.node.childNodes;
      for (let i = 0; i < childNodes.length; i++) {
        divElement.appendChild(childNodes[i].cloneNode(true));
      }

      match.node.parentNode.replaceChild(divElement, match.node);
    });
  }
};
