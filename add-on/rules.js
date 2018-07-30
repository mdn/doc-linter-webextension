(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.linter = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

const WARNING = require('./doctests.js').WARNING;

const reAbsoluteURL = /^(?:https?:)?\/\/developer\.mozilla\.org(?=\/)/i;

exports.absoluteURLsForInternalLinks = {
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

},{"./doctests.js":9}],2:[function(require,module,exports){
/*
 *  Title: Test whether discouraged statements are used in example code.
 *
 *  Example 1: <pre>alert("Some message");</pre> should be avoided and
 *  <pre>console.log("Some message");</pre> be used instead.
 *
 *  Implementation notes: This test checks all <pre> blocks for the usage of discouraged functions.
 *  In some cases their usage may not be avoided, like for example on their description pages.
 *  The test does not account for those cases, though.
 */

const mapMatches = require('./doctests.js').mapMatches;
const ERROR = require('./doctests.js').ERROR;

exports.alertPrintInCode = {
  name: "alert_print_in_code",
  desc: "alert_print_in_code_desc",
  check: function checkAlertPrintInCode(rootElement) {
    let pres = rootElement.getElementsByTagName("pre");
    let matches = [];
    for (let i = 0; i < pres.length; i++) {
      let preMatches = pres[i].textContent.match(/(?:alert|print|eval|document\.write)\s*\((?:.|\n)+?\)/gi) || [];
      matches = matches.concat(mapMatches(preMatches, ERROR));
    }

    return matches;
  }
};

},{"./doctests.js":9}],3:[function(require,module,exports){
/*
 * Title : Test that each internal links match with an anchor
 */

const ERROR = require('./doctests.js').ERROR;

const REGEX_ID = /#(.*)/

exports.anchorExists = {
  name: 'anchor_exists',
  desc: 'anchor_exists_desc',
  check: function checkAnchorExists(rootElement) {
    let matches = [];
    let anchors = rootElement.querySelectorAll('a[href^="#"]');
    for(let anchor of anchors) {
      let id = REGEX_ID.exec(anchor.href)[0];
      let link = rootElement.querySelector(`${id}`);

      if(link === null) matches.push({msg: id, type: ERROR});
    }

    return matches;
  }
};

},{"./doctests.js":9}],4:[function(require,module,exports){
/*
 *  Title: Test whether the API syntax headlines are named correctly, i.e. 'Parameters',
 *  'Return value' and 'Exceptions', and whether they appear in the correct order.
 *
 *  Example 1: The return value should have 'Return value' as headline and not 'Returns'.
 *
 *  Example 2: Exceptions should have 'Exceptions' as headline and not 'Errors' or 'Errors thrown'.
 *
 *  Example 3: Having an 'Exceptions' section before the 'Return value' section should be avoided.
 *  The correct order of the sections is 'Parameters', 'Return value' and 'Exceptions'.
 *
 *  Implementation notes: This test searches for specific keywords like 'returns' or 'errors' and
 *  expects the headlines to be <h3> elements under a <h2>Syntax</h2> section.
 */

const ERROR = require('./doctests.js').ERROR;

const disallowedNames = new Map([
  ["arguments", "Parameters"],
  ["returns", "Return value"],
  ["errors", "Exceptions"],
  ["errors thrown", "Exceptions"],
  ["exceptions thrown", "Exceptions"]
]);
const validOrder = [
  new Set(["parameters", "arguments"]),
  new Set(["return value", "returns"]),
  new Set(["exceptions", "exceptions thrown", "errors", "errors thrown"])
];

exports.apiSyntaxHeadlines = {
  name: "api_syntax_headlines",
  desc: "api_syntax_headlines_desc",

  check: function checkAPISyntaxHeadlines(rootElement) {
    let headlines = rootElement.getElementsByTagName("h2");
    let syntaxSection = null;
    let order = [];
    let matches = [];
    for (let i = 0; !syntaxSection && i < headlines.length; i++) {
      if (headlines[i].textContent === "Syntax") {
        syntaxSection = headlines[i];
      }
    }

    if (syntaxSection) {
      let subHeadingElements = [];
      let element = syntaxSection.nextSibling;
      while (element && element.localName !== "h2") {
        if (element.localName === "h3") {
          subHeadingElements.push(element);
        }
        element = element.nextSibling;
      }
      for (let i = 0; i < subHeadingElements.length; i++) {
        let subHeading = subHeadingElements[i].textContent.toLowerCase();
        for (let j = 0; j < validOrder.length; j++) {
          let heading = validOrder[j];
          if (heading.has(subHeading)) {
            order.push(j);
          }
        }
        if (disallowedNames.has(subHeading)) {
          matches.push({
            node: subHeadingElements[i],
            msg: "invalid_headline_name",
            msgParams: [subHeadingElements[i].textContent],
            type: ERROR
          });
        }
      }

      // Check the order of the headlines
      for (let i = 1; i < order.length; i++) {
        if (order[i] < order[i - 1]) {
          matches.push({
            msg: "invalid_headline_order",
            type: ERROR
          });
        }
      }
    }

    return matches;
  },

  fix: function fixAPISyntaxHeadlines(matches) {
    matches.forEach(match => {
      switch (match.msg) {
        case "invalid_headline_name":
          match.node.textContent = disallowedNames.get(match.node.textContent.toLowerCase());
          break;
      }
    });
  }
};

},{"./doctests.js":9}],5:[function(require,module,exports){
/*
 *  Title: Test the length and read time of the article.
 *
 *  Example 1: An article length of 1000 words will result in a read time estimation of 4 minutes.
 *
 *  Implementation notes: This test expects a reading speed of 275 words per minute. The text is
 *  roughly split by word bounderies using a regular expression. An article exceeding some length
 *  threshold (2000 words by default) is considered long.
 */


const WARNING = require('./doctests.js').WARNING;
const INFO = require('./doctests.js').INFO;

// TODO: Implement the preferences for LONG_ARTICLE_WORD_COUNT_THRESHOLD
const LONG_ARTICLE_WORD_COUNT_THRESHOLD = 2000;
const WORDS_PER_MINUTE = 275;

exports.articleLength = {
  name: "article_length",
  desc: "article_length_desc",
  check: function checkArticleLength(rootElement) {
    let text = rootElement.textContent;
    let wordCount = text.match(/\w+/g).length;
    let readTimeEstimation = Math.round(wordCount / WORDS_PER_MINUTE);
    if (readTimeEstimation === 0) {
      readTimeEstimation = "< 1";
    }
    let matches = [{
      msg: "article_length_info",
      msgParams: [String(wordCount), String(readTimeEstimation)],
      type: INFO
    }];
    if (wordCount > LONG_ARTICLE_WORD_COUNT_THRESHOLD) {
      matches.push({
        msg: "long_article",
        type: WARNING
      });
    }
    return matches;
  }
};

},{"./doctests.js":9}],6:[function(require,module,exports){
/*
 *  Title: Test whether code blocks unexpectedly contain <code> elements, which break the syntax
 *  highlighting.
 *
 *  Example 1: <pre class="brush:js"><code>var x = 1;</code></pre> is considered invalid and
 *  should rather be written as <pre class="brush:js">var x = 1;</pre>.
 *
 *  Implementation notes: This test checks whether <pre> elements contain <code> elements.
 */

const ERROR = require('./doctests.js').ERROR;

exports.codeInPre = {
  name: "code_in_pre",
  desc: "code_in_pre_desc",
  check: function checkCodeInPre(rootElement) {
    let codesInPres = rootElement.querySelectorAll("pre code");
    let matches = [];

    for (let i = 0; i < codesInPres.length; i++) {
      matches.push({
        node: codesInPres[i],
        msg: codesInPres[i].outerHTML,
        type: ERROR
      });
    }

    return matches;
  },
  fix: function fixCodeInPre(matches) {
    matches.forEach(match => {
      let children = new DocumentFragment();
      for (let i = 0; i < match.node.childNodes.length; i++) {
        children.appendChild(match.node.childNodes[i].cloneNode(true));
      }
      match.node.parentNode.replaceChild(children, match.node);
    });
  }
};

},{"./doctests.js":9}],7:[function(require,module,exports){
/*
 *  Title: Test that data macros have a note above them pointing to their data sources.
 *
 *  Example 1: If you are using e.g. the {{compat}} or {{cssinfo}} macros, there should
 *  be a hidden note for contributors in edit-mode, so that they know where the data comes
 *  from and how to change it.
 *
 *  Implementation notes: This test checks if there is a note for each macro
 *  (by checking whether the sibling element before the element containing the macro
 *  has class="hidden") and whether that note contains a link (i.e. an <a href="http...">
 *  element; it doesn't check whether the link is valid).
 */

const ERROR = require('./doctests.js').ERROR;

const dataMacros = /^(?:compat|css_ref|cssanimatedproperties|cssinfo|csssyntax|webextbrowsercompat)$/i;

exports.dataMacroNote = {
  name: "data_macro_note",
  desc: "data_macro_note_desc",
  check: function checkDataMacroNote(rootElement) {
    let treeWalker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_TEXT,
      {
        // eslint-disable-next-line
        acceptNode: node => node.textContent.match(/\{\{.*?\}\}/) ?
                NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      }
    );
    let matches = [];

    while (treeWalker.nextNode()) {
      let reMacroName = /\{\{\s*([^(}\s]+).*?\}\}/g;
      let macroNameMatch = reMacroName.exec(treeWalker.currentNode.textContent);
      while (macroNameMatch) {
        let noteElement = treeWalker.currentNode.parentNode.previousSibling;
        if (dataMacros.test(macroNameMatch[1])) {
          if (!noteElement || !noteElement.classList.contains("hidden")) {
            matches.push({
              msg: "data_macro_note_missing",
              msgParams: [macroNameMatch[0]],
              type: ERROR
            });
          } else if (!noteElement.querySelector("[href^='http']")) {
            matches.push({
              msg: "data_macro_source_link_missing",
              msgParams: [macroNameMatch[0]],
              type: ERROR
            });
          }
        }
        macroNameMatch = reMacroName.exec(treeWalker.currentNode.textContent);
      }
    }

    return matches;
  }
};

},{"./doctests.js":9}],8:[function(require,module,exports){
/*
 *  Title: Test for wrong locales in links (<a href>).
 *
 *  Example 1: If you are in a German document, internal links should
 *  contain the "de" locale and not e.g. "en-US".
 *
 *  Implementation notes: This test compares the current locale in the slug (document.URL)
 *  with the locale used in internal links (<a href>)
 */

const ERROR = require('./doctests.js').ERROR;

exports.differentLocaleLinks = {
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
        let oldAttachmentLink = false;
        let compareLocale = false;
        if(linkLocale !== null) {
          oldAttachmentLink = !linkLocale.startsWith("@");
          compareLocale = linkLocale.toLowerCase() !== pageLocale.toLowerCase();
        }
        let internalLinks = !linkDomain || linkDomain === pageDomain;

        if(linkLocale !== null && linkLocale && oldAttachmentLink && compareLocale && internalLinks) {
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

},{"./doctests.js":9}],9:[function(require,module,exports){
/* eslint-disable */
// Utilities for all tests

const ERROR = 1;
const WARNING = 2;
const INFO = 3;

exports.ERROR = ERROR;
exports.WARNING = WARNING;
exports.INFO = INFO;

exports.mapMatches = function mapMatches(matches, type) {
  return matches.map(match => ({msg: match, type}));
}

exports.isNewParagraphHelper = function isNewParagraphHelper(element) {
  if (!element || element.localName !== "span") {
    return false;
  }

  let style = element.getAttribute("style");
  return style && /z-index:\s*9999;/.test(style);
}

},{}],10:[function(require,module,exports){
/*
 *  Title: Test for macros with empty brackets.
 *
 *  Example 1: The {{CompatNo}} macro does not expect any parameters, so the parameter brackets
 *  are redundant and should be avoided, i.e. it should not be written as {{CompatNo()}}.
 *
 *  Implementation notes: This test checks for macros written with empty brackets and requests to
 *  remove them. It does not check whether the macros actually require parameters.
 */

const ERROR = require('./doctests.js').ERROR;

const reMacroWithEmptyBrackets = /\{\{\s*(.*?)\(\)\s*\}\}/gi;

exports.emptyBrackets = {
  name: "empty_brackets",
  desc: "empty_brackets_desc",

  check: function checkEmptyBrackets(rootElement) {
    let treeWalker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_TEXT,
        // eslint-disable-next-line
      {acceptNode: node => reMacroWithEmptyBrackets.test(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT}
    );
    let matches = [];

    while (treeWalker.nextNode()) {
      let textNodeMatches = treeWalker.currentNode.textContent.match(reMacroWithEmptyBrackets) || [];
      textNodeMatches.forEach(match => {
        matches.push({
          node: treeWalker.currentNode,
          msg: match,
          type: ERROR
        });
      });
    }

    return matches;
  },

  fix: function fixEmptyBrackets(matches) {
    let previousNode = null;
    matches.forEach(match => {
      if (match.node !== previousNode) {
        match.node.textContent = match.node.textContent
            .replace(reMacroWithEmptyBrackets, "{{$1}}");
      }
      previousNode = match.node;
    });
  }
};

},{"./doctests.js":9}],11:[function(require,module,exports){
/*
 *  Title: Test for empty elements.
 *
 *  Example 1: Paragraphs only containing a non-breaking space (<p>&nbsp;</p>) should be avoided.
 *
 *  Implementation notes: This test checks for elements containing no text or only space
 *  characters excluding the new paragraph helper of CKEditor and self-closing elements except
 *  <br> and <wbr> elements.
 */

const ERROR = require('./doctests.js').ERROR;
const WARNING = require('./doctests.js').WARNING;

const isNewParagraphHelper = require('./doctests.js').isNewParagraphHelper;

exports.emptyElements = {
  name: "empty_elements",
  desc: "empty_elements_desc",
  check: function checkEmptyElements(rootElement) {
    let treeWalker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: node => {
            // matching self-closing elements and td elements and excluding them
          if (!node.localName.match(/^link|track|param|area|command|col|base|meta|hr|source|img|keygen|br|wbr|input$/i) &&
                !node.localName.match(/^td$/i) && node.textContent.match(/^(?:&nbsp;|\s|\n)*$/)) {
              // Exclude new paragraph helper
            if (isNewParagraphHelper(node.firstElementChild)) {
              return NodeFilter.FILTER_REJECT;
            }

              // Elements containing self-closing elements except <br> and <wbr> are considered non-empty
            let descendantSelfClosingElements = node.querySelectorAll(
                  "link,track,param,area,command,col,base,meta,hr,source,img,keygen,input");
            return descendantSelfClosingElements.length === 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );
    let matches = [];

    while (treeWalker.nextNode()) {
      matches.push({
        node: treeWalker.currentNode,
        msg: treeWalker.currentNode.outerHTML,
        type: treeWalker.currentNode.localName === "td" ? WARNING : ERROR
      });
    }

    return matches;
  },

  fix: function fixEmptyElements(matches) {
    matches.forEach(match => {
      if (match.type === ERROR) {
        match.node.remove();
      }
    });
  }
};

},{"./doctests.js":9}],12:[function(require,module,exports){
/*
 *  Title: Test for example headings starting with 'Example:'.
 *
 *  Example 1: <h3>Example: Simple example</h3> should rather be written as <h3>Simple example</h3>
 *
 *  Implementation notes: This test checks whether the text of heading elements start with
 *  'Example:'.
 */

const ERROR = require('./doctests.js').ERROR;

const reExample = /^\s*Example:[\s_]*/;

exports.exampleColonHeading = {
  name: "example_headings",
  desc: "example_headings_desc",

  check: function checkExampleColonHeading(rootElement) {
    let headlines = rootElement.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let matches = [];

    for (let i = 0; i < headlines.length; i++) {
      if (headlines[i].textContent.match(reExample)) {
        matches.push({
          node: headlines[i],
          msg: headlines[i].outerHTML,
          type: ERROR
        });
      }
    }

    return matches;
  },

  fix: function fixExampleColonHeading(matches) {
    matches.forEach(match => {
      match.node.textContent = match.node.textContent.replace(reExample, "");
      let id = match.node.getAttribute("id");
      id = id.replace(reExample, "");
      match.node.setAttribute("id", id);
    });
  }
};

},{"./doctests.js":9}],13:[function(require,module,exports){
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

const ERROR = require('./doctests.js').ERROR;

exports.fontElements = {
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

},{"./doctests.js":9}],14:[function(require,module,exports){
/*
 *  Title: Test for HTML comments (i.e. <!-- -->).
 *
 *  Example 1: Because an HTML comment like
 *  <!-- This is a simple example for how the API is used. -->
 *  is only visible to article authors, it should rather either be made visible to readers,
 *  e.g. by replacing it by
 *  <p>This is a simple example for how the API is used.</p>
 *  or just be removed.
 *
 *  Implementation notes: This test searches for all HTML comments. Because CKEditor escapes them
 *  for security reasons, they need to be decoded first before displaying them.
 */

const ERROR = require('./doctests.js').ERROR;

exports.htmlComments = {
  name: "html_comments",
  desc: "html_comments_desc",
  check: function checkHTMLComments(rootElement) {
    let treeWalker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_COMMENT
    );
    let matches = [];

    while (treeWalker.nextNode()) {
      let comment = treeWalker.currentNode.data.replace(/\s*\{cke_protected\}\{C\}(\S+)\s*/,
          (match, data) => decodeURIComponent(data));
      matches.push({
        node: treeWalker.currentNode,
        msg: comment,
        type: ERROR
      });
    }

    return matches;
  },
  fix: function fixHTMLComments(matches) {
    matches.forEach(match => {
      match.node.remove();
    });
  }
};

},{"./doctests.js":9}],15:[function(require,module,exports){
/*
 *  Title: Test for http link usages where https should be used.
 *
 *  Example 1: <a href="http://mozilla.org">Mozilla</a> should rather be
 *  <a href="https://mozilla.org">Mozilla</a>.
 *
 *  Implementation notes: This test checks whether links refer to HTTP URLs. Because some URLs
 *  don't provide HTTPS access, matches are only output as warnings.
 */

const WARNING = require('./doctests.js').WARNING;

exports.httpLinks = {
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

},{"./doctests.js":9}],16:[function(require,module,exports){
/*
 *  Title: Test for sidebar macros that are not wrapped in <div> elements
 *
 *  Example 1: <p>{{APIRef}}</p> should be replaced by <div>{{APIRef}}</div>.
 *
 *  Implementation notes: This test checks whether some named macros are wrapped in other elements
 *  than <div>s.
 */

const ERROR = require('./doctests.js').ERROR;

exports.incorrectlyWrappedSidebarMacros = {
  name: "incorrectly_wrapped_sidebar_macros",
  desc: "incorrectly_wrapped_sidebar_macros_desc",

  check: function checkIncorrectlyWrappedSidebarMacros(rootElement) {
    const allowedMacros = /^(?:apiref|cssref|htmlref|jsref|makesimplequicklinks|mathmlref|svgrefelem)$|sidebar$/i;

    let treeWalker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_TEXT,
        // eslint-disable-next-line
      {acceptNode: node => node.textContent.match(/\{\{.*?\}\}/) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT}
    );
    let matches = [];

    while (treeWalker.nextNode()) {
      let reMacroName = /\{\{\s*([^(}\s]+).*?\}\}/g;
      let macroNameMatch = reMacroName.exec(treeWalker.currentNode.textContent);
      while (macroNameMatch) {
        if (macroNameMatch[1].match(allowedMacros) !== null &&
            treeWalker.currentNode.parentElement.localName !== "div") {
          matches.push({
            node: treeWalker.currentNode.parentElement,
            msg: "wrong_element_wrapping_sidebar_macro",
            msgParams: [macroNameMatch[0], treeWalker.currentNode.parentElement.localName],
            type: ERROR
          });
        }
        macroNameMatch = reMacroName.exec(treeWalker.currentNode.textContent);
      }
    }

    return matches;
  },

  fix: function fixIncorrectlyWrappedSidebarMacros(matches) {
    matches.forEach(match => {
      let divElement = document.createElement("div");
      let childNodes = match.node.childNodes;
      for (let i = 0; i < childNodes.length; i++) {
        divElement.appendChild(childNodes[i].cloneNode(true));
      }

      match.node.parentNode.replaceChild(divElement, match.node);
    });
  }
};

},{"./doctests.js":9}],17:[function(require,module,exports){
const docTests = {
  absoluteURLsForInternalLinks : require('./absolute-urls-for-internal-links.js').absoluteURLsForInternalLinks,
  alertPrintInCode : require('./alert-print-in-code.js').alertPrintInCode,
  anchorExists : require('./anchor-exists.js').anchorExists,
  apiSyntaxHeadlines : require('./api-syntax-headlines.js').apiSyntaxHeadlines,
  articleLength : require('./article-length.js').articleLength,
  codeInPre : require('./code-in-pre.js').codeInPre,
  dataMacroNote : require('./data-macro-note.js').dataMacroNote,
  differentLocaleLinks : require('./different-locale-links.js').differentLocaleLinks,
  emptyBrackets : require('./empty-brackets.js').emptyBrackets,
  emptyElements : require('./empty-elements.js').emptyElements,
  exampleColonHeading : require('./example-colon-heading.js').exampleColonHeading,
  fontElements : require('./font-elements.js').fontElements,
  htmlComments : require('./html-comments.js').htmlComments,
  httpLinks : require('./http-links.js').httpLinks,
  incorrectlyWrappedSidebarMacros : require('./incorrectly-wrapped-sidebar-macros.js').incorrectlyWrappedSidebarMacros,
  invalidMacros : require('./invalid-macros.js').invalidMacros,
  lineLengthInPre : require('./line-length-in-pre.js').lineLengthInPre,
  linkCount : require('./link-count.js').linkCount,
  macroSyntaxError : require('./macro-syntax-error.js').macroSyntaxError,
  mixedContent : require('./mixed-content.js').mixedContent,
  nameAttribute : require('./name-attribute.js').nameAttribute,
  oldURLs : require('./old-urls.js').oldURLs,
  preWithoutClass : require('./pre-without-class.js').preWithoutClass,
  shellPrompts : require('./shell-prompts.js').shellPrompts,
  spanCount : require('./span-count.js').spanCount,
  styleAttribute : require('./style-attribute.js').styleAttribute,
  summaryHeading : require('./summary-heading.js').summaryHeading,
  unnecessaryMacroParams : require('./unnecessary-macro-params.js').unnecessaryMacroParams,
  urlInLinkTitle : require('./url-in-link-title.js').urlInLinkTitle,
  wrongHighlightedLine : require('./wrong-highlighted-line.js').wrongHighlightedLine,
  wrongSyntaxClass : require('./wrong-syntax-class.js').wrongSyntaxClass
};

module.exports = docTests;

},{"./absolute-urls-for-internal-links.js":1,"./alert-print-in-code.js":2,"./anchor-exists.js":3,"./api-syntax-headlines.js":4,"./article-length.js":5,"./code-in-pre.js":6,"./data-macro-note.js":7,"./different-locale-links.js":8,"./empty-brackets.js":10,"./empty-elements.js":11,"./example-colon-heading.js":12,"./font-elements.js":13,"./html-comments.js":14,"./http-links.js":15,"./incorrectly-wrapped-sidebar-macros.js":16,"./invalid-macros.js":18,"./line-length-in-pre.js":19,"./link-count.js":20,"./macro-syntax-error.js":21,"./mixed-content.js":22,"./name-attribute.js":23,"./old-urls.js":24,"./pre-without-class.js":25,"./shell-prompts.js":26,"./span-count.js":27,"./style-attribute.js":28,"./summary-heading.js":29,"./unnecessary-macro-params.js":30,"./url-in-link-title.js":31,"./wrong-highlighted-line.js":32,"./wrong-syntax-class.js":33}],18:[function(require,module,exports){
/*
 *  Title: Test for the usage of invalid macros.
 *
 *  Example 1: The usage of <p>{{SomeMacro}}</p> should rather be removed, replaced by a valid
 *  macro or by static text and {{SomeMacro}} should be deleted.
 *
 *  Implementation notes: This test uses an (incomprehensive) whitelist of allowed macros and a
 *  list of obsolete macros. Obsolete macros are marked as errors, all others, which are not
 *  whitelisted are marked as warnings.
 */

const ERROR = require('./doctests.js').ERROR;
const WARNING = require('./doctests.js').WARNING;

const obsoleteMacros = [
  "languages"
];

exports.invalidMacros = {
  name: "invalid_macros",
  desc: "invalid_macros_desc",
  check: function checkInvalidMacros(rootElement) {
    const allowedMacros = [
      "addonsidebar",
      "apiref",
      "anch",
      "availableinworkers",
      "bug",
      "canvassidebar",
      "chromebug",
      "communitybox",
      "compat",
      "cssdata",
      "cssinfo",
      "cssref",
      "csssyntax",
      "cssxref",
      "defaultapisidebar",
      "deprecated_header",
      "deprecated_inline",
      "discussionlist",
      "docstatus",
      "domxref",
      "draft",
      "edgebug",
      "embedghlivesample",
      "embedlivesample",
      "embedyoutube",
      "event",
      "eventref",
      "experimental_inline",
      "firefox_for_developers",
      "fx_minversion_inline",
      "fxos_maxversion_inline",
      "fxos_minversion_inline",
      "gecko",
      "gecko_minversion_inline",
      "geckorelease",
      "glossary",
      "groupdata",
      "htmlattrdef",
      "htmlattrxref",
      "htmlelement",
      "htmlref",
      "httpheader",
      "httpmethod",
      "httpsidebar",
      "httpstatus",
      "includesubnav",
      "inheritancediagram",
      "interface",
      "interfacedata",
      "jsfiddlelink",
      "jsref",
      "jssidebar",
      "jsxref",
      "js_property_attributes",
      "l10n:common",
      "l10n:compattable",
      "l10n:css",
      "l10n:javascript",
      "l10n:svg",
      "localizationstatusinsection",
      "mathmlelement",
      "mathmlref",
      "next",
      "non-standard_header",
      "non-standard_inline",
      "noscript_inline",
      "obsolete_header",
      "obsolete_inline",
      "optional_inline",
      "page",
      "previous",
      "previousmenunext",
      "previousnext",
      "promote-mdn",
      "property_prefix",
      "readonlyinline",
      "releasegecko",
      "rfc",
      "seecompattable",
      "sidebarutilities",
      "sm_minversion_inline",
      "spec2",
      "specname",
      "svgattr",
      "svgdata",
      "svgelement",
      "svginfo",
      "svgref",
      "tb_minversion_inline",
      "webextapiembedtype",
      "webextapiref",
      "webextapisidebar",
      "webextchromecompat",
      "webextexamplesdata",
      "webextexamples",
      "webglsidebar",
      "webkitbug",
      "webrtcsidebar",
      "xref",
      "xulattr",
      "xulelem"
    ];

    let treeWalker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_TEXT,
        // eslint-disable-next-line
      {acceptNode: node => node.textContent.match(/\{\{.*?\}\}/) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT}
    );
    let matches = [];

    while (treeWalker.nextNode()) {
      let reMacroName = /\{\{\s*([^(}\s]+).*?\}\}/g;
      let macroNameMatch = reMacroName.exec(treeWalker.currentNode.textContent);
      while (macroNameMatch) {
        if (obsoleteMacros.includes(macroNameMatch[1].toLowerCase())) {
          matches.push({
            node: treeWalker.currentNode,
            msg: "obsolete_macro",
            msgParams: [macroNameMatch[0]],
            type: ERROR
          });
        } else if (!allowedMacros.includes(macroNameMatch[1].toLowerCase())) {
          matches.push({
            msg: macroNameMatch[0],
            type: WARNING
          });
        }
        macroNameMatch = reMacroName.exec(treeWalker.currentNode.textContent);
      }
    }

    return matches;
  },

  fix: function fixInvalidMacros(matches) {
    let reObsoleteMacros =
        new RegExp(`\\{\\{\\s*(?:${obsoleteMacros.join("|")}).*?\\}\\}`, "gi");

    matches.forEach(match => {
      if (!match.node) {
        return;
      }

      match.node.textContent = match.node.textContent.replace(reObsoleteMacros, "");
      if (match.node.parentNode.textContent.match(/^(\s|&nbsp;)*$/)) {
        match.node.parentNode.remove();
      }
    });
  }
};

},{"./doctests.js":9}],19:[function(require,module,exports){
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


const WARNING = require('./doctests.js').WARNING;
const mapMatches = require('./doctests.js').mapMatches;

exports.lineLengthInPre = {
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

},{"./doctests.js":9}],20:[function(require,module,exports){
/*
 * Title : Test whether there are too many links in a page
 * This is done for SEO reasons, based on the assumption that in the case of a lot of links not all of them would be followed and indexed.
 *
 *  A Warning is emitted between 100 and 250 links
 *  An Error is emitted for more than 250 links
 *  An Info is emitted with the amount of links
 */

const WARNING = require('./doctests.js').WARNING;
const ERROR = require('./doctests.js').ERROR;
const INFO = require('./doctests.js').INFO;

exports.linkCount = {
  name: "link_count",
  desc: "link_count_desc",
  check: function checkLinkCost(rootElement) {
    let links = rootElement.getElementsByTagName("a");

    if(links.length >= 100 && links.length < 250) {
      return [{
        msg: "count_link_warning",
        msgParams: [links.length],
        type: WARNING
      }];
    }

    if(links.length >= 250) {
      return [{
        msg: "count_link_error",
        msgParams: [links.length],
        type: ERROR
      }];
    }

    return [{
      msg: "count_link_info",
      msgParams: [links.length],
      type: INFO
    }];
  },

  fix: function fixLinkCost(matches) {
    return;
  }
};

},{"./doctests.js":9}],21:[function(require,module,exports){
/*
 *  Title: Test for syntax errors in macro calls.
 *
 *  Example 1: {{macro} misses a closing curly brace, so it will be recognized as error.
 *
 *  Example 2: {{macro('param'}} misses a closing bracket, so it will be recognized as error.
 *
 *  Example 3: {{macro("param"))}} has an additional closing bracket, so it will be recognized as error.
 *
 *  Example 4: {{macro('param)}} and {{macro(param")}} have incorrectly quoted string parameters,
 *  so they will be recognized as errors.
 *
 *  Implementation notes: This test uses regular expressions to recognize invalid macros.
 *  It currently fails to properly validate macros containing JSON parameters (see issue #139).
 */

const ERROR = require('./doctests.js').ERROR;

exports.macroSyntaxError = {
  name: "macro_syntax_error",
  desc: "macro_syntax_error_desc",
  check: function checkMacroSyntaxError(rootElement) {
    function validateStringParams(macro) {
      let paramListStartIndex = macro.indexOf("(") + 1;
      let paramListEndMatch = macro.match(/\)*\s*\}{1,2}$/);
      let paramListEndIndex = macro.length - paramListEndMatch[0].length;
      let stringParamQuote = "";
      for (let i = paramListStartIndex; i < paramListEndIndex; i++) {
        if (macro[i] === "\"") {
          if (stringParamQuote === "") {
            stringParamQuote = "\"";
          } else if (stringParamQuote === "\"" && macro[i - 1] !== "\\") {
            stringParamQuote = "";
          }
        } else if (macro[i] === "'") {
          if (stringParamQuote === "") {
            stringParamQuote = "'";
          } else if (stringParamQuote === "'" && macro[i - 1] !== "\\") {
            stringParamQuote = "";
          }
        } else if (stringParamQuote === "" && macro[i].match(/[^\s,\d\-.]/)) {
          return false;
        }
      }
      return stringParamQuote === "";
    }

    let treeWalker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_TEXT,
        // eslint-disable-next-line
      {acceptNode: node => node.textContent.match(/\{\{[^\(\}]*\([^\}]*\}\}|\{\{[^\}]*?\}(?:(?=[^\}])|$)/) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT}
    );
    let matches = [];

    while (treeWalker.nextNode()) {
      let textNodeMatches = treeWalker.currentNode.textContent.match(/\{\{[^(}]*\([^}]*\}\}|\{\{[^}]*?\}(?:(?=[^}])|$)/gi) || [];
      textNodeMatches.forEach(macro => {
        if (macro.match(/[^}]\}$/)) {
          matches.push({
            msg: "missing_closing_curly_brace",
            msgParams: [macro],
            type: ERROR
          });
        }
        if (macro.match(/^\{\{[^(]+\(.+?[^)\s]\s*\}\}$/)) {
          matches.push({
            msg: "missing_closing_bracket",
            msgParams: [macro],
            type: ERROR
          });
        }
        if (!validateStringParams(macro)) {
          matches.push({
            msg: "string_parameter_incorrectly_quoted",
            msgParams: [macro],
            type: ERROR
          });
        }
        if (macro.match(/\){2,}\}{1,2}$/)) {
          matches.push({
            msg: "additional_closing_bracket",
            msgParams: [macro],
            type: ERROR
          });
        }
      });
    }

    return matches;
  }
};

},{"./doctests.js":9}],22:[function(require,module,exports){
/*
 * Title : Prevent non https content inclusion
 *
 * Implementation notes : We check that every <img href=""> is using https://
 */

const ERROR = require('./doctests.js').ERROR;

// The string must start by https://
const HTTPS_URL = /^https:\/\//

exports.mixedContent = {
  name: "mixed_content",
  desc: "mixed_content_desc",
  check: function checkMixedContent(rootElement) {
    let images = rootElement.getElementsByTagName("img");
    let matches = [];

    for(let index = 0; index < images.length; index++){
      if(!images[index].getAttribute("src").match(HTTPS_URL)) {
        matches.push({node: images[index], msg: images[index].outerHTML, type: ERROR});
      }
    }

    return matches;
  }
};

},{"./doctests.js":9}],23:[function(require,module,exports){
/*
 *  Title: Test for elements with 'name' attributes.
 *
 *  Example 1: <h2 name="Syntax">Syntax</h2> should rather be <h2 id="Syntax"Syntax</h2>.
 *
 *  Example 2: The name="" attribute in <p name="someunusedname">paragraph</h2> should rather be
 *  removed.
 *
 *  Implementation notes: This test checks all elements containing 'name' attributes.
 */

const ERROR = require('./doctests.js').ERROR;

exports.nameAttribute = {
  name: "name_attributes",
  desc: "name_attributes_desc",
  check: function checkNameAttribute(rootElement) {
    let elementsWithNameAttribute = rootElement.querySelectorAll("[name]");
    let matches = [];

    for (let i = 0; i < elementsWithNameAttribute.length; i++) {
      matches.push({
        node: elementsWithNameAttribute[i],
        msg: `name="${elementsWithNameAttribute[i].getAttribute("name")}"`,
        type: ERROR
      });
    }

    return matches;
  },
  fix: function fixNameAttribute(matches) {
    matches.forEach(match => {
      match.node.removeAttribute("name");
    });
  }
};

},{"./doctests.js":9}],24:[function(require,module,exports){
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

const ERROR = require('./doctests.js').ERROR;

exports.oldURLs = {
  name: "old_en_urls",
  desc: "old_en_urls_desc",
  check: function checkOldURLs(rootElement) {
    let links = rootElement.querySelectorAll("a[href^='/en/' i]");
    let matches = [];

    for (let i = 0; i < links.length; i++) {
      matches.push({
        msg: links[i].outerHTML,
        type: ERROR
      });
    }

    return matches;
  }
};

},{"./doctests.js":9}],25:[function(require,module,exports){
/*
 *  Title: Test for code blocks without 'class' attribute specifying the syntax highlighting.
 *
 *  Example 1: <pre>var x = 1</pre> should rather be replaced by
 *  <pre class="brush: js">var x = 1</pre>.
 *
 *  Implementation notes: This test checks all <pre> elements that have either an empty 'class'
 *  attribute or none at all. It also checks for elements that have the class 'eval'
 */

const WARNING = require('./doctests.js').WARNING;
const ERROR = require('./doctests.js').ERROR;

exports.preWithoutClass = {
  name: "pre_without_class",
  desc: "pre_without_class_desc",
  check: function checkPreWithoutClass(rootElement) {
    let presWithoutClass = rootElement.querySelectorAll("pre:not([class]), pre[class='']");
    let presWithEvalClass = rootElement.querySelectorAll("pre[class='eval']");
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

    for(let i = 0; i < presWithEvalClass.length; i++) {
      matches.push({
        msg: presWithEvalClass[i].outerHTML,
        type: ERROR
      });
    }

    return matches;
  }
};

},{"./doctests.js":9}],26:[function(require,module,exports){
/*
 *  Title: Test for shell prompts, i.e. lines starting with '>' or '$' in code blocks.
 *
 *  Example 1: <pre class="brush: plain">$user: </pre> should rather be replaced by
 *  <pre class="brush: plain"></pre>.
 *
 *  Implementation notes: This test checks whether lines within <pre> elements start with '$' or
 *  '>'.
 */

const ERROR = require('./doctests.js').ERROR;

exports.shellPrompts = {
  name: "shell_prompts",
  desc: "shell_prompts_desc",
  check: function checkShellPrompts(rootElement) {
    let pres = rootElement.querySelectorAll("pre");
    let matches = [];

    for (let i = 0; i < pres.length; i++) {
      let code = pres[i].innerHTML.replace(/<br\/?>/g, "\n").replace("&nbsp;", " ");
      let shellPrompts = code.match(/^(?:\$|&gt;).*/gm);
      if (shellPrompts) {
        shellPrompts.forEach(function addMatch(shellPrompt) {
          matches.push({
            msg: shellPrompt.replace(/<.+?>/g, ""),
            type: ERROR
          });
        });
      }
    }

    return matches;
  }
};

},{"./doctests.js":9}],27:[function(require,module,exports){
/*
 *  Title: Test for incorrectly used <span> elements.
 *
 *  Example 1: <span style="font-style: italic;">Emphasized text/<span> should rather be replaced
 *  by <em>Emphasized text</em>.
 *
 *  Implementation notes: This test searches for all <span> elements, which don't hold the SEO
 *  summary and are not part of CKEditor's new paragraph helper.
 */

const ERROR = require('./doctests.js').ERROR;

const isNewParagraphHelper = require('./doctests.js').isNewParagraphHelper;

exports.spanCount = {
  name: "span_elements",
  desc: "span_elements_desc",

  check: function checkSpanCount(rootElement) {
    let spanElements = rootElement.querySelectorAll("span:not(.seoSummary)");
    let matches = [];

    for (let i = 0; i < spanElements.length; i++) {
      let node = spanElements[i];

      // Exclude new paragraph helper
      if (isNewParagraphHelper(node) || isNewParagraphHelper(node.firstElementChild)) {
        continue;
      }

      matches.push({
        node,
        msg: node.outerHTML,
        type: ERROR
      });
    }

    return matches;
  },

  fix: function fixSpanCount(matches) {
    matches.forEach(match => {
      // Remove element in case it is unstyled
      if (!match.node.getAttribute("id") && !match.node.getAttribute("class") && !match.node.getAttribute("style")) {
        match.node.remove();
      }
    });
  }
};

},{"./doctests.js":9}],28:[function(require,module,exports){
/*
 *  Title: Test for incorrectly 'style' attributes.
 *
 *  Example 1: <p style="font-style: italic;">Emphasized text/<p> should rather be replaced
 *  by <p>Emphasized text</p>.
 *
 *  Implementation notes: This test searches for all 'style' attributes, which are not part of
 *  CKEditor's new paragraph helper.
 */

const ERROR = require('./doctests.js').ERROR;

const isNewParagraphHelper = require('./doctests.js').isNewParagraphHelper;

exports.styleAttribute = {
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

},{"./doctests.js":9}],29:[function(require,module,exports){
/*
 *  Title: Test for obsolete 'Summary' heading.
 *
 *  Example 1: <h2>Summary</h2> is redundant, because the page title is shown above the article,
 *  so it should be removed.
 *
 */


const ERROR = require('./doctests.js').ERROR;

exports.summaryHeading = {
  name: "summary_heading",
  desc: "summary_heading_desc",

  check: function checkSummaryHeading(rootElement) {
    let headlines = rootElement.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let matches = [];

    if (headlines[0].textContent.match(/^\s*Summary\s*$/)) {
      matches.push({
        node: headlines[0],
        msg: headlines[0].outerHTML,
        type: ERROR
      });
    }

    return matches;
  },

  fix: function fixSummaryHeading(matches) {
    matches.forEach(match => match.node.remove());
  }
};

},{"./doctests.js":9}],30:[function(require,module,exports){
/*
 *  Title: Test for obsolete macro parameters.
 *
 *  Example 1: Some macros like {{JSRef}} don't require parameters anymore, so they should be
 *  removed.
 *
 *  Example 2: Some macros like {{cssinfo}} don't require parameters when the related information
 *  can be read from the page's slug, so they should be removed in those cases.
 *
 *  Implementation notes: This test checks for a specific list of macros, which either have no
 *  parameters at all or their parameters are redundant. It uses the page title for comparison, so
 *  the unit test doesn't break while working on about:blank.
 */


const ERROR = require('./doctests.js').ERROR;

const reMacrosNotRequiringParams = /\{\{\s*(?:JSRef|csssyntax|cssinfo|svginfo)\([^)]+?\)\s*\}\}/i;
const reMacrosNotRequiringParamsGlobal = new RegExp(reMacrosNotRequiringParams.source, "gi");

exports.unnecessaryMacroParams = {
  name: "unnecessary_macro_params",
  desc: "unnecessary_macro_params_desc",
  check: function checkUnnecessaryMacroParams(rootElement) {
    let treeWalker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_TEXT,
      {
        // eslint-disable-next-line
        acceptNode: node => node.textContent.match(reMacrosNotRequiringParams) ?
                NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      }
    );
    let matches = [];

    while (treeWalker.nextNode()) {
      let textNodeMatches = treeWalker.currentNode.textContent.match(
          reMacrosNotRequiringParamsGlobal) || [];
      textNodeMatches.forEach(match => {
        let paramMatch = match.match(/(?:csssyntax|cssinfo|svginfo)\((["'])(.+?)\1/i);
        if (paramMatch) {
          let param = paramMatch[2];
          if (param === document.title.replace(/^(.+?) \| Edit.*$/, "$1")) {
            matches.push({
              msg: "macro_with_unnecessary_params_equalling_slug",
              msgParams: [match],
              type: ERROR
            });
          }
        } else {
          matches.push({
            msg: "macro_with_unused_params",
            msgParams: [match],
            type: ERROR
          });
        }
      });
    }

    return matches;
  }
};

},{"./doctests.js":9}],31:[function(require,module,exports){
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

const ERROR = require('./doctests.js').ERROR;

exports.urlInLinkTitle = {
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

},{"./doctests.js":9}],32:[function(require,module,exports){
/*
 *  Title: Test for incorrect line highlights in code examples.
 *
 *  Example 1: Negative highlights like in
 *  <pre class="brush: js; highlight[-1]">var x = 1;</pre>
 *  are invalid.
 *
 *  Example 2: Highlights exceeding the line count like in
 *  <pre class="brush: js; highlight[20]">var x = 1;</pre>
 *  are invalid.
 *
 *  Example 3: Highlighted ranges of lines exceeding the line count like in
 *  <pre class="brush: js; highlight[10-20]">var x = 1;</pre>
 *  are invalid.
 *
 *  Example 4: Highlighted ranges where the start line is bigger than the end line line in
 *  <pre class="brush: js; highlight[2-1]">var x = 1;\nvar y = 2;</pre>
 *  are invalid.
 *
 *  Implementation notes: This test searches for all <pre> elements containing a 'highlight'
 *  class, then splits the numbers and ranges wrapped by square brackets following the 'highlight'
 *  class and finally checks each item whether its valid.
 */

const ERROR = require('./doctests.js').ERROR;

const reHighlighting = /highlight:?\s*\[(.+?)\]/i;

exports.wrongHighlightedLine = {
  name: "wrong_highlighted_line",
  desc: "wrong_highlighted_line_desc",

  check: function checkWrongHighlightedLine(rootElement) {
    let presWithHighlighting = rootElement.querySelectorAll("pre[class*='highlight']");
    let matches = [];

    for (let i = 0; i < presWithHighlighting.length; i++) {
      let match = presWithHighlighting[i].getAttribute("class").match(reHighlighting);
      if (match) {
        let numbersAndRanges = match[1].split(",");
        let lineCount = presWithHighlighting[i].innerHTML.split(/<br\s*\/?>|\n/gi).length;

        numbersAndRanges.forEach(numberOrRange => {
          let start;
          let end;
          [, start, end] = numberOrRange.match(/^\s*(-?\d+)(?:\s*-\s*(-?\d+))?\s*$/);

          if (start === undefined) {
            return;
          }

          start = Number(start);
          end = Number(end);

          if (start <= 0) {
            matches.push({
              node: presWithHighlighting[i],
              msg: "highlighted_line_number_not_positive",
              msgParams: [String(start), match[1]],
              type: ERROR
            });
          }
          if (start > lineCount) {
            matches.push({
              node: presWithHighlighting[i],
              msg: "highlighted_line_number_too_big",
              msgParams: [String(start), String(lineCount), match[1]],
              type: ERROR
            });
          }
          if (!Number.isNaN(end)) {
            if (end > lineCount) {
              matches.push({
                node: presWithHighlighting[i],
                msg: "highlighted_line_number_too_big",
                msgParams: [String(end), String(lineCount), match[1]],
                type: ERROR
              });
            }
            if (end <= 0) {
              matches.push({
                node: presWithHighlighting[i],
                msg: "highlighted_line_number_not_positive",
                msgParams: [String(end), match[1]],
                type: ERROR
              });
            }
            if (start > end) {
              matches.push({
                node: presWithHighlighting[i],
                msg: "invalid_highlighted_range",
                msgParams: [String(start), String(end), match[1]],
                type: ERROR
              });
            }
          }
        });
      }
    }

    return matches;
  },

  fix: function fixWrongHighlightedLine(matches) {
    matches.forEach(match => {
      match.node.className = match.node.className.replace(reHighlighting, "").replace(/;\s*$/, "");
    });
  }
};

},{"./doctests.js":9}],33:[function(require,module,exports){
/*
 *  Title: Test for whether the 'syntax' class is properly used on a syntax block.
 *
 *  Example 1: <pre> elements following a 'Formal syntax' heading are expected to contain a syntax
 *  definition, which needs to be styled using class="syntaxbox".
 *
 *  Example 2: <pre> elements following a 'Syntax' heading where there is no 'Formal syntax'
 *  section are expected to contain a syntax definition, which needs to be styled using
 *  class="syntaxbox".
 *
 *  Implementation notes: This test first searches for an <h3>Formal syntax</h3> heading. If none
 *  is found, it searches for a <h2>Syntax</h2> heading. If one of those is found, the following
 *  <pre> element is expected to hold a syntax definition, which needs to be styled using
 *  class="syntaxbox".
 */

const ERROR = require('./doctests.js').ERROR;

exports.wrongSyntaxClass = {
  name: "wrong_syntax_class",
  desc: "wrong_syntax_class_desc",
  check: function checkWrongSyntaxClass(rootElement) {
    function checkPre(heading) {
      let element = heading.nextSibling;
      while (element && element.localName !== "h2") {
        if (element.localName === "pre" && element.className !== "syntaxbox") {
          return {
            node: element,
            msg: "wrong_syntax_class_used",
            msgParams: [element.className],
            type: ERROR
          };
        }
        element = element.nextElementSibling;
      }
      return undefined;
    }

    let subHeadings = rootElement.getElementsByTagName("h3");
    let formalSyntaxSection = null;
    for (let i = 0; !formalSyntaxSection && i < subHeadings.length; i++) {
      if (subHeadings[i].textContent.match(/Formal syntax/i)) {
        formalSyntaxSection = subHeadings[i];
      }
    }

    let matches = [];
    if (formalSyntaxSection) {
      let match = checkPre(formalSyntaxSection);
      if (match) {
        matches.push(match);
      }
    } else {
      let headings = rootElement.getElementsByTagName("h2");
      let syntaxSection = null;
      for (let i = 0; !syntaxSection && i < headings.length; i++) {
        if (headings[i].textContent.toLowerCase() === "syntax") {
          syntaxSection = headings[i];
        }
      }

      if (syntaxSection) {
        let match = checkPre(syntaxSection);
        if (match) {
          matches.push(match);
        }
      }
    }

    return matches;
  },
  fix: function fixWrongSyntaxClass(matches) {
    matches.forEach(match => {
      match.node.className = "syntaxbox";
    });
  }
};

},{"./doctests.js":9}]},{},[17])(17)
});
