/*
 *  Title: Test for old /en/ MDN URLs.
 *
 *  Example 1: All URLs using MDN links, which contain "/en/" as locale should be replaced by
 *  "/en-US/" URLs. E.g. <a href="/en/docs/CSS">CSS</a> should rather be
 *  <a href="/en-US/docs/Web/CSS">CSS</a>.
 *
 *  Implementation notes: This test checks whether a link's 'href' attribute starts with "/en/".
 *  It does not check whether the link is an internal MDN link, nor does it check different
 *  locales than the English one.
 */

docTests.oldURLs = {
  name: "old_en_urls",
  desc: "old_en_urls_desc",
  check: function checkOldURLs(rootElement) {
    let links = rootElement.querySelectorAll("a[href]");
    let matches = [];

    for (let i = 0; i < links.length; i++) {
      // This check can be removed once querySelectorAll supports case-insensitive search,
      // i.e. a[href^='/en/' i] (see bug 888190, fixed in Firefox 47.0)
      if (links[i].getAttribute("href").match(/^\/en\//i)) {
        matches.push({
          msg: links[i].outerHTML,
          type: ERROR
        });
      }
    }

    return matches;
  }
};
