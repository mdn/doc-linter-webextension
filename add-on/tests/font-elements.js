/*
 *  Title: Test for deprecated <font> elements that should be removed or replaced by other
 *  elements.
 *
 *  Example 1: <font style="font-size: 20px;">Emphasized text</font> should be replaced by
 *  <em>Emphasized text</em> or <b>Emphasized text</b>.
 *
 *  Example 2: <h3><font style="color: black;">Heading</font></h3> should be replaced by
 *  <h3>Heading</h3>.
 *
 *  Implementation notes: This test searches for all <font> elements, but doesn't provide
 *  a hint whether they should be removed or replaced by other elements.
 */

docTests.fontElements = {
  name: "font_elements",
  desc: "font_elements_desc",
  check: function checkFontElements(rootElement) {
    let fontElements = rootElement.getElementsByTagName("font");
    let matches = [];

    for (let i = 0; i < fontElements.length; i++) {
      matches.push({
        msg: fontElements[i].outerHTML,
        type: ERROR
      });
    }

    return matches;
  }
};
