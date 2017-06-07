/* eslint-disable */
// Utilities for all tests

const ERROR = 1;
const WARNING = 2;
const INFO = 3;

let docTests = {};

function mapMatches(matches, type) {
  return matches.map(match => ({msg: match, type}));
}

function isNewParagraphHelper(element) {
  if (!element || element.localName !== "span") {
    return false;
  }

  let style = element.getAttribute("style");
  return style && /z-index:\s*9999;/.test(style);
}
