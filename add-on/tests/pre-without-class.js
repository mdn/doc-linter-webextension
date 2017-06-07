/*
 *  Title: Test for code blocks without 'class' attribute specifying the syntax highlighting.
 *
 *  Example 1: <pre>var x = 1</pre> should rather be replaced by
 *  <pre class="brush: js">var x = 1</pre>.
 *
 *  Implementation notes: This test checks all <pre> elements that have either an empty 'class'
 *  attribute or none at all.
 */

docTests.preWithoutClass = {
  name: "pre_without_class",
  desc: "pre_without_class_desc",
  check: function checkPreWithoutClass(rootElement) {
    let presWithoutClass = rootElement.querySelectorAll("pre:-moz-any(:not([class]), [class=''])");
    let matches = [];

    for (let i = 0; i < presWithoutClass.length; i++) {
      // If the content is recognized as folder structure, don't add a warning for empty <pre>
      if (presWithoutClass[i].textContent.match(/^\S[^\n*]*\/\n/)) {
        continue;
      }

      let type = WARNING;

      // If the content is recognized as code or {{csssyntax}} macro, mark it as error
      if (presWithoutClass[i].textContent.match(/^\s*(?:\/\*.+?\*\/|<.+?>|@[^\s\n]+[^\n]*\{\n|\{\{\s*csssyntax(?:\(\))?\s*\}\})/)) {
        type = ERROR;
      }

      matches.push({
        msg: presWithoutClass[i].outerHTML,
        type
      });
    }

    return matches;
  }
};
