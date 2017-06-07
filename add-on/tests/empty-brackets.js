/*
 *  Title: Test for macros with empty brackets.
 *
 *  Example 1: The {{CompatNo}} macro does not expect any parameters, so the parameter brackets
 *  are redundant and should be avoided, i.e. it should not be written as {{CompatNo()}}.
 *
 *  Implementation notes: This test checks for macros written with empty brackets and requests to
 *  remove them. It does not check whether the macros actually require parameters.
 */

const reMacroWithEmptyBrackets = /\{\{\s*(.*?)\(\)\s*\}\}/gi;

docTests.emptyBrackets = {
  name: "empty_brackets",
  desc: "empty_brackets_desc",

  check: function checkEmptyBrackets(rootElement) {
    let treeWalker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_TEXT,
        // eslint-disable-next-line
      {acceptNode: node => reMacroWithEmptyBrackets.test(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT}
    );
    let matches = [];

    while (treeWalker.nextNode()) {
      let textNodeMatches = treeWalker.currentNode.textContent.match(reMacroWithEmptyBrackets) || [];
      textNodeMatches.forEach(match => {
        matches.push({
          node: treeWalker.currentNode,
          msg: match,
          type: ERROR
        });
      });
    }

    return matches;
  },

  fix: function fixEmptyBrackets(matches) {
    let previousNode = null;
    matches.forEach(match => {
      if (match.node !== previousNode) {
        match.node.textContent = match.node.textContent
            .replace(reMacroWithEmptyBrackets, "{{$1}}");
      }
      previousNode = match.node;
    });
  }
};
