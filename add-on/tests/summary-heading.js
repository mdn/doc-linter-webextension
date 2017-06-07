/*
 *  Title: Test for obsolete 'Summary' heading.
 *
 *  Example 1: <h2>Summary</h2> is redundant, because the page title is shown above the article,
 *  so it should be removed.
 *
 *  Implementation notes: This test searches for all headings, which contain the text 'Summary'.
 *  In CSS articles the summary headings still need to be kept due to bug 1201600, though the test
 *  currently still marks them as errors (see issue #209). Also, summaries placed at the end of
 *  articles are incorrectly recognized as errors (see issue #208).
 */

docTests.summaryHeading = {
  name: "summary_heading",
  desc: "summary_heading_desc",

  check: function checkSummaryHeading(rootElement) {
    let headlines = rootElement.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let matches = [];

    for (let i = 0; i < headlines.length; i++) {
      if (headlines[i].textContent.match(/^\s*Summary\s*$/)) {
        matches.push({
          node: headlines[i],
          msg: headlines[i].outerHTML,
          type: ERROR
        });
      }
    }

    return matches;
  },

  fix: function fixSummaryHeading(matches) {
    matches.forEach(match => match.node.remove());
  }
};
