/**
 * Search "oo"(keyword) in "foobar200"(text)
 * @param {string} keyword
 * @param {string} text
 */
export const searchKeywordInText = (keyword: string, text: string) =>
  text.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;

/**
 * Search "234"(keyword) in `123456`(text)
 * @param {string} keyword
 * @param {number} number
 */
export const searchKeywordInNumberText = (keyword: string, number: number) =>
  searchKeywordInText(keyword, String(number));

/**
 * Search string 'do' in string array ['dog', 'cat']
 * @param {string|undefined} keyword Search keyword
 * @param {string[]} tags The table cell value
 * @return {boolean}
 */
export const searchStringInArray = (keyword: string, tags: string[]) =>
  tags.reduce((prev, tag) => prev || searchKeywordInText(keyword, tag), false);

/**
 * Search exact keyword 'dog' NOT in string array ['dog', 'cat'] (Inverse exact match)
 * @param {string|undefined} keyword Search keyword
 * @param {string[]} tags The table cell value
 * @return {boolean}
 */
export const searchExactStringNotInArray = (keyword: string, tags: string[]) =>
  tags.every((tag) => !searchKeywordInText(keyword, tag));

// keywords="ap+ba" tags=["apple","banana"]
// take 1st kw "ap": "apple".indexOf("ap")=>0, "banana".indexOf("ap")=>-1, data has tags matched "ap", => true
// take 2rd kw "ba": "apple".indexOf("ba")=>-1, "banana".indexOf("ba")=>0, data has tags matched "ba", => true
// true && true => true
export const searchKeywordsInTagsWithLogicAnd = (
  keywords: string[],
  tags: string[]
) => keywords.reduce((prev, kw) => prev && searchStringInArray(kw, tags), true);

// keywords="ap ba" data=["apple","pair"]
// take 1st kw "ap": "apple".indexOf("ap")=>0, "pair".indexOf("ap")=>-1, data has tags matched "ap", => true
// take 2rd kw "ba": "apple".indexOf("ba")=>-1, "pair".indexOf("ba")=>-1, data has no tags matched "ba", => false
// true || false => true
export const searchKeywordsInTagsWithLogicOr = (
  keywords: string[],
  tags: string[]
) =>
  keywords.reduce((prev, kw) => prev || searchStringInArray(kw, tags), false);

/**
 * Search filterKeyword in cellValue
 * @param {string} filterKeyword Search keyword
 * - AND: "a+b" to search ["a","b"]
 * - OR : "a b" to search ["a"]
 * @param {string[]} [cellValue] The table cell value
 */
export const stringArrayFilter = (
  filterKeyword: string,
  cellValue: string[] = []
) => {
  // first will try to parse operator from filterKeyword
  // choose different search logic based on operator

  // AND
  if (filterKeyword.indexOf('+') !== -1) {
    const keywords = filterKeyword.split('+');
    return searchKeywordsInTagsWithLogicAnd(keywords, cellValue);
  }

  // OR
  if (filterKeyword.indexOf(' ') !== -1) {
    const keywords = filterKeyword.split(' ');
    return searchKeywordsInTagsWithLogicOr(keywords, cellValue);
  }

  // Inverse exact match
  if (filterKeyword.startsWith('!')) {
    const inverseKeyword = filterKeyword.slice(1);
    return searchExactStringNotInArray(inverseKeyword, cellValue);
  }

  return searchStringInArray(filterKeyword, cellValue);
};
