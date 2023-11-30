/* eslint-disable max-len */

import { SortOrder } from 'antd/es/table/interface';
import * as constants from '../../constants';
import DbColumn from '../../types/DbColumn';
import { RowType } from '../../types/Data';

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
  tags.forEach((subCellValue) => {
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

export const isAllFilterInvalid = (
  filter: { [key: string]: string },
  filterColumnIds: string[]
) => {
  const validFilter = filterColumnIds.filter((colId) => !!filter[colId]);
  return validFilter.length === 0;
};

const filterFnMapping: {
  [key: string]: Function;
} = {
  [constants.NUMBER]: searchNumberKeywordInText,
  [constants.STRING]: searchKeywordInText,
  [constants.STRING_ARRAY]: stringArrayFilter,
};
const defaultValueMapping: {
  [key: string]: string | string[];
} = {
  [constants.STRING]: '',
  [constants.STRING_ARRAY]: [],
};

/**
 * @param {Object} filterKeyVals
 * @param {Column[]} filterColumns The table columns definitions,
 * but only the col which is filterable
 */
const searchByFilter =
  (filterColumns: DbColumn[], filterKeyVals: { [key: string]: string }) =>
  (row: RowType) =>
    filterColumns.reduce((prev, column: DbColumn) => {
      const keyword = filterKeyVals[column.id];
      let matched = true;
      if (keyword) {
        matched = filterFnMapping[column.type](
          keyword,
          row[column.id] || defaultValueMapping[column.type]
        );
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
export const getFilteredData = (
  filterColumns: DbColumn[],
  filterKeyVals: { [key: string]: string },
  originalRows: RowType[]
) => {
  if (
    isAllFilterInvalid(
      filterKeyVals,
      filterColumns.map((column) => column.id)
    )
  ) {
    return originalRows;
  }

  return originalRows.filter(searchByFilter(filterColumns, filterKeyVals));
};

export const getSortedData = (
  originalData: RowType[],
  sorter: {
    // TODO this type is from antd
    columnKey: string;
    order: string;
  }
) =>
  [...originalData].sort((a, b) => {
    const result = `${a[sorter.columnKey] || ''}`.localeCompare(
      b[sorter.columnKey] || ''
    );
    if (sorter.order === 'ascend') {
      return result;
    }
    return -result; // descend
  });

// https://stackoverflow.com/questions/840781/get-all-non-unique-values-i-e-duplicate-more-than-one-occurrence-in-an-array
export const findDuplicates = (arr: string[]) => {
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
export const getInitialFilter = (filterProp: DbColumn[]) => {
  let filter: {
    [key: string]: string;
  } = {
    // [column.id]: ""
  };

  // init field key with empty value
  filterProp.forEach((f) => {
    filter[f.id] = '';
  });

  // @ts-ignore TODO
  const url = new URL(window.location);
  // init field key with values passing from URL
  const filterParam = url.searchParams.get('filter');

  if (filterParam && filterParam.startsWith('{')) {
    try {
      filter = JSON.parse(filterParam);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        'Failed to parse filter param from URL, filterParam:',
        filterParam,
        ', error:',
        error
      );
    }
  }

  return filter;
};

export const getInitialSorter = () => {
  let sorter = {
    columnKey: '',
    order: '',
  };
  // @ts-ignore TODO
  const url = new URL(window.location);
  const sorterParam = url.searchParams.get('sorter');
  if (sorterParam && sorterParam.startsWith('{')) {
    try {
      sorter = JSON.parse(sorterParam);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        'Failed to parse filter param from URL, sorter:',
        sorter,
        ', error:',
        error
      );
    }
  }
  return sorter;
};

export const updateUrl = (states: { [key: string]: string }) => {
  // @ts-ignore TODO
  const url = new URL(window.location);
  Object.keys(states).forEach((stateKey) => {
    if (typeof states[stateKey] === 'object') {
      url.searchParams.set(stateKey, JSON.stringify(states[stateKey]));
      return;
    }
    url.searchParams.set(stateKey, states[stateKey]);
  });
  window.history.pushState({ ...states }, '', url);
};

export const getColumnSortOrder = (
  columnId: string,
  sorter: {
    // TODO this type is from antd
    columnKey: string;
    order: string;
  }
) => {
  if (sorter.order === undefined) {
    return null;
  }
  if (sorter.columnKey === columnId) {
    return sorter.order as SortOrder;
  }
  return null;
};
