/*
 *  Title: Test for incorrectly used URLs in link titles.
 *
 *  Example 1: The 'title' attribute on
 *  <a href="/en-US/docs/Web/CSS" title="/en-US/docs/Web/CSS">CSS</a>
 *  should be removed, because it's redundant.
 *
 *  Example 2: The 'title' attribute on
 *  <a href="/en-US/docs/Web/CSS" title="/en/docs/CSS">CSS</a>
 *  should be removed, because it's redundant and misleading.
 *
 *  Implementation notes: This test checks whether the 'title' attribute of an <a> element
 *  contains the same URL or a part of it as within its 'href' attribute. It also handles URLs
 *  using two-character locales vs. four character locales, e.g. "/en-US/" and "/en/".
 */

docTests.urlInLinkTitle = {
  name: "url_in_link_title",
  desc: "url_in_link_title_desc",
  check: function checkURLsInTitleAttributes(rootElement) {
    let linkElements = rootElement.getElementsByTagName("a");
    let matches = [];

    for (let i = 0; i < linkElements.length; i++) {
      let href = (linkElements[i].getAttribute("href") || "").toLowerCase();
      let title = (linkElements[i].getAttribute("title") || "").toLowerCase();
      if (title !== "" && (href.indexOf(title) !== -1 ||
          (title.match(/[a-z]{2}(?:-[A-Z]{2})?\/docs\/.*?\//) ||
           title === href.replace(/([a-z]{2})(?:-[a-z]{2})?\/docs\/(.*)/, "$1/$2")))) {
        matches.push({
          node: linkElements[i],
          msg: linkElements[i].outerHTML,
          type: ERROR
        });
      }
    }

    return matches;
  },
  fix: function fixURLsInTitleAttributes(matches) {
    matches.forEach(match => {
      match.node.removeAttribute("title");
    });
  }
};
