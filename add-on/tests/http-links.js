/*
 *  Title: Test for http link usages where https should be used.
 *
 *  Example 1: <a href="http://mozilla.org">Mozilla</a> should rather be
 *  <a href="https://mozilla.org">Mozilla</a>.
 *
 *  Implementation notes: This test checks whether links refer to HTTP URLs. Because some URLs
 *  don't provide HTTPS access, matches are only output as warnings.
 */

docTests.httpLinks = {
  name: "http_links",
  desc: "http_links_desc",
  check: function checkHTTPLinks(rootElement) {
    let httpLinks = rootElement.querySelectorAll("a[href^='http://']");
    let matches = [];

    for (let i = 0; i < httpLinks.length; i++) {
      matches.push({
        msg: httpLinks[i].outerHTML,
        type: WARNING
      });
    }

    return matches;
  }
};
