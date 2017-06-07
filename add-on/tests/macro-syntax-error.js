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

docTests.macroSyntaxError = {
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
