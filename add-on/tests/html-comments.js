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

docTests.htmlComments = {
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
