/*
 *  Title: Test the length and read time of the article.
 *
 *  Example 1: An article length of 1000 words will result in a read time estimation of 4 minutes.
 *
 *  Implementation notes: This test expects a reading speed of 275 words per minute. The text is
 *  roughly split by word bounderies using a regular expression. An article exceeding some length
 *  threshold (2000 words by default) is considered long.
 */

// TODO: Implement the preferences for LONG_ARTICLE_WORD_COUNT_THRESHOLD
const LONG_ARTICLE_WORD_COUNT_THRESHOLD = 2000;
const WORDS_PER_MINUTE = 275;

docTests.articleLength = {
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
