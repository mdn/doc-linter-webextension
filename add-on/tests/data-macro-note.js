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

const dataMacros = /^(?:compat|css_ref|cssanimatedproperties|cssinfo|csssyntax|webextbrowsercompat)$/i;

docTests.dataMacroNote = {
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
