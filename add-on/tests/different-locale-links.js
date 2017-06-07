/*
 *  Title: Test for wrong locales in links (<a href>).
 *
 *  Example 1: If you are in a German document, internal links should
 *  contain the "de" locale and not e.g. "en-US".
 *
 *  Implementation notes: This test compares the current locale in the slug (document.URL)
 *  with the locale used in internal links (<a href>)
 */

docTests.differentLocaleLinks = {
  name: "different_locale_links",
  desc: "different_locale_links_desc",
  check: function checkDifferentLocaleLinks(rootElement) {
    let [, pageDomain, pageLocale] = document.URL.match(/^(?:https?:\/\/)(.+?)\/([^/]+)/i) ||
        ["", "developer.mozilla.org", "en-US"];
    let links = rootElement.getElementsByTagName("a");
    let matches = [];
    for (let i = 0; i < links.length; i++) {
      let href = links[i].getAttribute("href");
      if (href) {
        let [, linkDomain, linkLocale] = href.match(/^(?:https?:\/\/(.+?))?\/([^/]+)/i) ||
            [null, null, null];
        if (linkLocale && linkLocale.toLowerCase() !== pageLocale.toLowerCase() &&
            (!linkDomain || linkDomain === pageDomain)) {
          matches.push({
            msg: "link_using_wrong_locale",
            msgParams: [href, pageLocale],
            type: ERROR
          });
        }
      }
    }

    return matches;
  }
};
