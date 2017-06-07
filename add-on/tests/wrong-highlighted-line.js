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

const reHighlighting = /highlight:?\s*\[(.+?)\]/i;

docTests.wrongHighlightedLine = {
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
