/**
 * Search "oo" (keyword) in "foobar200" (text)
 * @param {string} keyword
 * @param {string} text
 * @returns {boolean}
 */
export const searchKeywordInText = (keyword: string, text: string): boolean =>
  text.toLowerCase().includes(keyword.toLowerCase());

/**
 * Search "234" (keyword) in `123456` (text)
 * @param {string} keyword
 * @param {number} number
 * @returns {boolean}
 */
export const searchKeywordInNumberText = (
  keyword: string,
  number: number
): boolean => searchKeywordInText(keyword, String(number));

/**
 * Search string 'do' in string array ['dog', 'cat']
 * @param {string|undefined} keyword - Search keyword
 * @param {string[]} tags - The table cell value
 * @returns {boolean}
 */
export const searchStringInArray = (keyword: string, tags: string[]): boolean =>
  tags.some((tag) => searchKeywordInText(keyword, tag));

/**
 * Search exact keyword 'dog' NOT in string array ['dog', 'cat'] (Inverse exact match)
 * @param {string|undefined} keyword - Search keyword
 * @param {string[]} tags - The table cell value
 * @returns {boolean}
 */
export const searchExactStringNotInArray = (
  keyword: string,
  tags: string[]
): boolean => tags.every((tag) => !searchKeywordInText(keyword, tag));

/**
 * Search "a+b" (keyword) in ["a","b"] (fieldVal)
 * @param {string} filterKeyword - Search keyword
 * - AND: "a+b" to search ["a","b"]
 * - OR : "a b" to search ["a"]
 * @param {string[]} fieldVal - The field value of the table row/record
 * @returns {boolean}
 */
export const stringArrayFilter = (
  filterKeyword: string,
  fieldVal: string[] = []
): boolean => {
  // first will try to parse operator from filterKeyword
  // choose different search logic based on operator

  // AND
  if (filterKeyword.includes('+')) {
    return filterKeyword
      .split('+')
      .every((kw) => searchStringInArray(kw, fieldVal));
  }

  // OR
  if (filterKeyword.includes(' ')) {
    return filterKeyword
      .split(' ')
      .some((kw) => searchStringInArray(kw, fieldVal));
  }

  // Inverse exact match
  if (filterKeyword.startsWith('!')) {
    const inverseKeyword = filterKeyword.slice(1);
    return searchExactStringNotInArray(inverseKeyword, fieldVal);
  }

  return searchStringInArray(filterKeyword, fieldVal);
};
