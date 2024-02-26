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
export const searchNumberKeywordInText = (keyword: string, number: number) =>
  String(number).toLowerCase().indexOf(keyword.toLowerCase()) !== -1;

/**
 * Search keyword 'do' in string array ['dog', 'cat']
 * @param {string|undefined} keyword Search keyword
 * @param {string[]} tags The table cell value
 * @return {boolean}
 */
export const searchStringInArray = (keyword: string, tags: string[]) => {
  let match = false;

  if (keyword.startsWith('!')) {
    // Inverse exact match
    const inverseKeyword = keyword.slice(1);
    match = tags.every((tag) => !searchKeywordInText(inverseKeyword, tag));
  } else {
    tags.forEach((subCellValue) => {
      if (searchKeywordInText(keyword, subCellValue)) {
        match = true;
      }
    });
  }

  return match;
};

/**
 * Search keyword in string array, e.g. find "ap" in ["apple","banana"]
 * @param {string|undefined} keyword Search keyword
 * @param {string[]} tags The table cell value
 * @return {boolean}
 */
export const searchKeywordInTags = (keyword: string, tags: string[]) =>
  tags.reduce((prev, tag) => prev || searchKeywordInText(keyword, tag), false);

// keywords="ap+ba" tags=["apple","banana"]
// take 1st kw "ap": "apple".indexOf("ap")=>0, "banana".indexOf("ap")=>-1, data has tags matched "ap", => true
// take 2rd kw "ba": "apple".indexOf("ba")=>-1, "banana".indexOf("ba")=>0, data has tags matched "ba", => true
// true && true => true
export const searchKeywordsInTagsWithLogicAnd = (
  keywords: string[],
  tags: string[]
) => keywords.reduce((prev, kw) => prev && searchKeywordInTags(kw, tags), true);

// keywords="ap ba" data=["apple","pair"]
// take 1st kw "ap": "apple".indexOf("ap")=>0, "pair".indexOf("ap")=>-1, data has tags matched "ap", => true
// take 2rd kw "ba": "apple".indexOf("ba")=>-1, "pair".indexOf("ba")=>-1, data has no tags matched "ba", => false
// true || false => true
export const searchKeywordsInTagsWithLogicOr = (
  keywords: string[],
  tags: string[]
) =>
  keywords.reduce((prev, kw) => prev || searchKeywordInTags(kw, tags), false);

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

  return searchStringInArray(filterKeyword, cellValue);
};
