/**
 * Search "oo" (keyword) in "foobar200" (string content)
 * @param {string} keyword
 * @param {string} text
 * @returns {boolean}
 */
export const searchKeywordInText = (keyword: string, text: string): boolean =>
  text.toLowerCase().includes(keyword.toLowerCase());

/**
 * Search "234" (keyword) in `123456` (number content)
 * @param {string} keyword
 * @param {number} number
 * @returns {boolean}
 */
export const searchKeywordInNumberText = (
  keyword: string,
  number: number
): boolean => searchKeywordInText(keyword, String(number));

/**
 * Search "do" (keyword) in ['dog', 'cat'] (array content)
 * @param {string|undefined} keyword - Search keyword
 * @param {string[]} arrayContent - The table cell value
 * @returns {boolean}
 */
export const searchStringInArray = (
  keyword: string,
  arrayContent: string[]
): boolean => arrayContent.some((item) => searchKeywordInText(keyword, item));

/**
 * Search "a+b" (keyword) in ["a","b"] (arrayContent)
 * @param {string} filterKeyword - Search keyword
 * - AND: "a+b" to search ["a","b"]
 * - OR : "a b" to search ["a"]
 * @param {string[]} arrayContent - The field value of the table row/record
 * @returns {boolean}
 */
export const searchKeywordInArray = (
  filterKeyword: string,
  arrayContent: string[] = []
): boolean => {
  // first will try to parse operator from filterKeyword
  // choose different search logic based on operator

  // AND - Search both 'dog' and 'cat' in string array ['dog', 'cat'] (AND)
  if (filterKeyword.includes('+')) {
    return filterKeyword
      .split('+')
      .every((kw) => searchStringInArray(kw, arrayContent));
  }

  // OR - Search 'dog' or 'cat' in string array ['dog', 'cat'] (OR)
  if (filterKeyword.includes(' ')) {
    return filterKeyword
      .split(' ')
      .some((kw) => searchStringInArray(kw, arrayContent));
  }

  // Inverse exact match - Search exact keyword 'dog' NOT in string array ['dog', 'cat'] (Inverse exact match)
  if (filterKeyword.startsWith('!')) {
    return arrayContent.every(
      (item) => !searchKeywordInText(filterKeyword.slice(1), item)
    );
  }

  return searchStringInArray(filterKeyword, arrayContent);
};
