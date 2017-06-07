/*
 *  Title: Test for the line length in code blocks.
 *
 *  Example 1: Code blocks with very long lines like
 *  <pre>This is some code block with a long line exceeding the maximum of 78 characters.</pre>
 *  should either be shortened or split into several lines to avoid the display of horizontal
 *  scrollbars.
 *
 *  Implementation notes: This test uses a threshold of 78 characters for the maximum length of
 *  a line. <br> tags added while editing are replaced by line breaks and all other HTML tags
 *  are removed.
 */

docTests.lineLengthInPre = {
  name: "pre_line_too_long",
  desc: "pre_line_too_long_desc",
  check: function checkLineLengthInPre(rootElement) {
    let pres = rootElement.getElementsByTagName("pre");
    let matches = [];

    for (let i = 0; i < pres.length; i++) {
      // While editing it happens that there are <br>s added instead of line break characters
      // Those need to be replaced by line breaks to correctly recognize long lines
      let codeBlock = pres[i].innerHTML.replace(/<br\/?>/g, "\n");

      // Remove all other HTML tags and only display the plain text
      codeBlock = codeBlock.replace(/<.+?>/g, "");

      let longLines = codeBlock.match(/^(?:[^\r\n]|\r(?!\n)){78,}$/gm);
      if (longLines) {
        matches = matches.concat(longLines);
      }
    }

    return mapMatches(matches, WARNING);
  }
};
