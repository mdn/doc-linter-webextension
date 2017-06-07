/*
 *  Title: Test for incorrectly 'style' attributes.
 *
 *  Example 1: <p style="font-style: italic;">Emphasized text/<p> should rather be replaced
 *  by <p>Emphasized text</p>.
 *
 *  Implementation notes: This test searches for all 'style' attributes, which are not part of
 *  CKEditor's new paragraph helper.
 */

docTests.styleAttribute = {
  name: "style_attributes",
  desc: "style_attributes_desc",
  check: function checkStyleAttribute(rootElement) {
    let elementsWithStyleAttribute = rootElement.querySelectorAll("[style]");
    let matches = [];

    for (let i = 0; i < elementsWithStyleAttribute.length; i++) {
      let node = elementsWithStyleAttribute[i];

      // Exclude new paragraph helper
      if (isNewParagraphHelper(node) || isNewParagraphHelper(node.firstElementChild)) {
        continue;
      }

      matches.push({
        msg: `style="${node.getAttribute("style")}"`,
        type: ERROR
      });
    }

    return matches;
  }
};
