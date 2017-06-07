/*
 *  Title: Test whether internal MDN links have absolute URLs.
 *
 *  Example 1: An MDN link to the 'display' CSS property should use a the relative URL
 *  /en-US/docs/Web/CSS/display and not the absolute URL
 *  https://developer.mozilla.org/en-US/docs/Web/CSS/display.
 *
 *  Implementation notes: This test checks whether the URL begins with the link
 *  "https://developer.mozilla.org/", this means that allizom.org links are not covered.
 *  window.location cannot be used for this, because that would break the unit test, which uses
 *  about:blank as URL.
 */

const reAbsoluteURL = /^(?:https?:)?\/\/developer\.mozilla\.org(?=\/)/i;

docTests.absoluteURLsForInternalLinks = {
  name: "absolute_urls_for_internal_links",
  desc: "absolute_urls_for_internal_links_desc",
  check: function checkAbsoluteURLsForInternalLinks(rootElement) {
    let links = rootElement.getElementsByTagName("a");
    let matches = [];
    for (let i = 0; i < links.length; i++) {
      let href = links[i].getAttribute("href");
      if (href && href.match(reAbsoluteURL)) {
        matches.push({
          node: links[i],
          msg: links[i].outerHTML,
          type: WARNING
        });
      }
    }

    return matches;
  },

  fix: function fixAbsoluteURLsForInternalLinks(matches) {
    matches.forEach(match => {
      let href = match.node.getAttribute("href");
      let relativeURL = href.replace(reAbsoluteURL, "");
      match.node.setAttribute("href", relativeURL);
      match.node.setAttribute("data-cke-saved-href", relativeURL);
    });
  }
};
