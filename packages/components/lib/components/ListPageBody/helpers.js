/* eslint-disable max-len */
import * as constants from '../../constants';
/**
 * Search "oo"(keyword) in "foobar200"(text)
 * @param {string} keyword
 * @param {string} text
 */

export const searchKeywordInText = (keyword, text) => text.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
/**
 * Search keyword in cellValue
 * @param {string} keyword
 */

const stringTypeFilter = (keyword, cellValue = '') => searchKeywordInText(keyword, cellValue);
/**
 * Search keyword in string array
 * @param {string|undefined} keyword Search keyword
 * @param {string[]} tags The table cell value
 * @return {boolean}
 */


export const searchStringInArray = (keyword, tags) => {
  let match = false;
  tags.forEach(subCellValue => {
    if (searchKeywordInText(keyword, subCellValue)) {
      match = true;
    }
  });
  return match;
};
/**
 * Search keyword in string array, e.g. find "ap" in ["apple","banana"]
 * @param {string|undefined} keyword Search keyword
 * @param {string[]} tags The table cell value
 * @return {boolean}
 */

export const searchKeywordInTags = (keyword, tags) => tags.reduce((prev, tag) => prev || searchKeywordInText(keyword, tag), false); // keywords="ap+ba" tags=["apple","banana"]
// take 1st kw "ap": "apple".indexOf("ap")=>0, "banana".indexOf("ap")=>-1, data has tags matched "ap", => true
// take 2rd kw "ba": "apple".indexOf("ba")=>-1, "banana".indexOf("ba")=>0, data has tags matched "ba", => true
// true && true => true

export const searchKeywordsInTagsWithLogicAnd = (keywords, tags) => keywords.reduce((prev, kw) => prev && searchKeywordInTags(kw, tags), true); // keywords="ap ba" data=["apple","pair"]
// take 1st kw "ap": "apple".indexOf("ap")=>0, "pair".indexOf("ap")=>-1, data has tags matched "ap", => true
// take 2rd kw "ba": "apple".indexOf("ba")=>-1, "pair".indexOf("ba")=>-1, data has no tags matched "ba", => false
// true || false => true

export const searchKeywordsInTagsWithLogicOr = (keywords, tags) => keywords.reduce((prev, kw) => prev || searchKeywordInTags(kw, tags), false);
/**
 * Search filterKeyword in cellValue
 * @param {string} filterKeyword Search keyword
 * - AND: "a+b" to search ["a","b"]
 * - OR : "a b" to search ["a"]
 * @param {string[]} [cellValue] The table cell value
 */

export const stringArrayFilter = (filterKeyword, cellValue = []) => {
  // AND
  if (filterKeyword.indexOf('+') !== -1) {
    const keywords = filterKeyword.split('+');
    return searchKeywordsInTagsWithLogicAnd(keywords, cellValue);
  } // OR


  if (filterKeyword.indexOf(' ') !== -1) {
    const keywords = filterKeyword.split(' ');
    return searchKeywordsInTagsWithLogicOr(keywords, cellValue);
  }

  return searchStringInArray(filterKeyword, cellValue);
};
export const isAllFilterInvalid = (filter, filterColumnIds) => {
  const validFilter = filterColumnIds.filter(colId => !!filter[colId]);
  return validFilter.length === 0;
};
const filterFnMapping = {
  [constants.STRING]: stringTypeFilter,
  [constants.STRING_ARRAY]: stringArrayFilter
};
/**
 * @param {Object} filterKeyVals
 * @param {Column[]} filterColumns The table columns definitions,
 * but only the col which is filterable
 */

const searchByFilter = (filterColumns, filterKeyVals) => row => filterColumns.reduce((prev, column) => {
  const keyword = filterKeyVals[column.id];
  let matched = true;

  if (keyword) {
    matched = filterFnMapping[column.type](keyword, row[column.id]);
  }

  return prev && matched;
}, true);
/**
 * @param {Object} filterKeyVals
 * @param {Array} originalRows
 * @param {Column[]} filterColumns The table columns definitions,
 * but only the col which is filterable
 * @returns {Array}
 */


export const getFilteredData = (filterColumns, filterKeyVals, originalRows) => {
  if (isAllFilterInvalid(filterKeyVals, filterColumns.map(column => column.id))) {
    return originalRows;
  }

  return originalRows.filter(searchByFilter(filterColumns, filterKeyVals));
};
export const getSortedData = (originalData, sorter) => [...originalData].sort((a, b) => {
  const result = `${a[sorter.columnKey] || ''}`.localeCompare(b[sorter.columnKey] || '');

  if (sorter.order === 'ascend') {
    return result;
  }

  return -result; // descend
}); // https://stackoverflow.com/questions/840781/get-all-non-unique-values-i-e-duplicate-more-than-one-occurrence-in-an-array

export const findDuplicates = arr => {
  const sortedArr = arr.slice().sort(); // You can define the comparing function here.
  // JS by default uses a crappy string compare.
  // (we use slice to clone the array so the
  // original array won't be modified)

  const results = [];

  for (let i = 0; i < sortedArr.length - 1; i += 1) {
    if (sortedArr[i + 1] === sortedArr[i]) {
      results.push(sortedArr[i]);
    }
  }

  return results;
};
/**
 * @returns {object} e.g. `{"name":"foo"}`
 */

export const getInitialFilter = filterProp => {
  let filter = {// [column.id]: ""
  }; // init field key with empty value

  filterProp.forEach(f => {
    filter[f.id] = '';
  });
  const url = new URL(window.location); // init field key with values passing from URL

  const filterParam = url.searchParams.get('filter');

  if (filterParam && filterParam.startsWith('{')) {
    try {
      filter = JSON.parse(filterParam);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse filter param from URL, filterParam:', filterParam, ', error:', error);
    }
  }

  return filter;
};
export const getInitialSorter = () => {
  let sorter = {
    columnKey: '',
    order: ''
  };
  const url = new URL(window.location);
  const sorterParam = url.searchParams.get('sorter');

  if (sorterParam && sorterParam.startsWith('{')) {
    try {
      sorter = JSON.parse(sorterParam);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to parse filter param from URL, sorter:', sorter, ', error:', error);
    }
  }

  return sorter;
};
export const updateUrl = states => {
  const url = new URL(window.location);
  Object.keys(states).forEach(stateKey => {
    if (typeof states[stateKey] === 'object') {
      url.searchParams.set(stateKey, JSON.stringify(states[stateKey]));
      return;
    }

    url.searchParams.set(stateKey, states[stateKey]);
  });
  window.history.pushState({ ...states
  }, '', url);
};
export const getColumnSortOrder = (columnId, sorter) => {
  if (sorter.order === undefined) {
    return false;
  }

  if (sorter.columnKey === columnId) {
    return sorter.order;
  }

  return false;
};