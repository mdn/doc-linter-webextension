/*
 *  Title: Test for incorrectly used <span> elements.
 *
 *  Example 1: <span style="font-style: italic;">Emphasized text/<span> should rather be replaced
 *  by <em>Emphasized text</em>.
 *
 *  Implementation notes: This test searches for all <span> elements, which don't hold the SEO
 *  summary and are not part of CKEditor's new paragraph helper.
 */

docTests.spanCount = {
  name: "span_elements",
  desc: "span_elements_desc",

  check: function checkSpanCount(rootElement) {
    let spanElements = rootElement.querySelectorAll("span:not(.seoSummary)");
    let matches = [];

    for (let i = 0; i < spanElements.length; i++) {
      let node = spanElements[i];

      // Exclude new paragraph helper
      if (isNewParagraphHelper(node) || isNewParagraphHelper(node.firstElementChild)) {
        continue;
      }

      matches.push({
        node,
        msg: node.outerHTML,
        type: ERROR
      });
    }

    return matches;
  },

  fix: function fixSpanCount(matches) {
    matches.forEach(match => {
      // Remove element in case it is unstyled
      if (!match.node.getAttribute("id") && !match.node.getAttribute("class") && !match.node.getAttribute("style")) {
        match.node.remove();
      }
    });
  }
};
