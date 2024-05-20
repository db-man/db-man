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
 * @param {string[]} strArr - The table cell value
 * @returns {boolean}
 */
export const searchStringInArray = (
  keyword: string,
  strArr: string[]
): boolean => strArr.some((item) => searchKeywordInText(keyword, item));

/**
 * Search "a+b" (keyword) in ["a","b"] (strArr)
 * @param {string} filterKeyword - Search keyword
 * - AND: "a+b" to search ["a","b"]
 * - OR : "a b" to search ["a"]
 * @param {string[]} strArr - The field value of the table row/record
 * @returns {boolean}
 */
export const stringArrayFilter = (
  filterKeyword: string,
  strArr: string[] = []
): boolean => {
  // first will try to parse operator from filterKeyword
  // choose different search logic based on operator

  // AND - Search both 'dog' and 'cat' in string array ['dog', 'cat'] (AND)
  if (filterKeyword.includes('+')) {
    return filterKeyword
      .split('+')
      .every((kw) => searchStringInArray(kw, strArr));
  }

  // OR - Search 'dog' or 'cat' in string array ['dog', 'cat'] (OR)
  if (filterKeyword.includes(' ')) {
    return filterKeyword
      .split(' ')
      .some((kw) => searchStringInArray(kw, strArr));
  }

  // Inverse exact match - Search exact keyword 'dog' NOT in string array ['dog', 'cat'] (Inverse exact match)
  if (filterKeyword.startsWith('!')) {
    return strArr.every(
      (item) => !searchKeywordInText(filterKeyword.slice(1), item)
    );
  }

  return searchStringInArray(filterKeyword, strArr);
};
