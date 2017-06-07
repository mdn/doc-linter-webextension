/*
 *  Title: Test for empty elements.
 *
 *  Example 1: Paragraphs only containing a non-breaking space (<p>&nbsp;</p>) should be avoided.
 *
 *  Implementation notes: This test checks for elements containing no text or only space
 *  characters excluding the new paragraph helper of CKEditor and self-closing elements except
 *  <br> and <wbr> elements.
 */

docTests.emptyElements = {
  name: "empty_elements",
  desc: "empty_elements_desc",
  check: function checkEmptyElements(rootElement) {
    let treeWalker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: node => {
            // matching self-closing elements and excluding them
          if (!node.localName.match(/^link|track|param|area|command|col|base|meta|hr|source|img|keygen|br|wbr|input$/i) &&
                node.textContent.match(/^(?:&nbsp;|\s|\n)*$/)) {
              // Exclude new paragraph helper
            if (isNewParagraphHelper(node.firstElementChild)) {
              return NodeFilter.FILTER_REJECT;
            }

              // Elements containing self-closing elements except <br> and <wbr> are considered non-empty
            let descendantSelfClosingElements = node.querySelectorAll(
                  "link,track,param,area,command,col,base,meta,hr,source,img,keygen,input");
            return descendantSelfClosingElements.length === 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );
    let matches = [];

    while (treeWalker.nextNode()) {
      matches.push({
        node: treeWalker.currentNode,
        msg: treeWalker.currentNode.outerHTML,
        type: treeWalker.currentNode.localName === "td" ? WARNING : ERROR
      });
    }

    return matches;
  },

  fix: function fixEmptyElements(matches) {
    matches.forEach(match => {
      if (match.type === ERROR) {
        match.node.remove();
      }
    });
  }
};
