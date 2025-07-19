/* eslint-disable max-len */

import { SortOrder } from 'antd/es/table/interface';

import DbColumn from '../../../types/DbColumn';
import { RowType } from '../../../types/Data';
import * as constants from '../../../constants';

import {
  searchKeywordInText,
  searchKeywordInNumberText,
  searchKeywordInArray,
} from './searchUtils';

// For each column type, define the filter function
const filterFnMapping: {
  [key: string]: Function;
} = {
  [constants.NUMBER]: searchKeywordInNumberText,
  [constants.STRING]: searchKeywordInText,
  [constants.STRING_ARRAY]: searchKeywordInArray,
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
  (row: RowType): boolean =>
    filterColumns.reduce<boolean>((prev, column: DbColumn) => {
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

export const filterCols = (columns: DbColumn[]): DbColumn[] =>
  columns.filter((col) => col['ui:listPage:isFilter']);

/**
 * Filter the data by filterKeyVals
 * @returns {RowType[]}
 */
export const getFilteredData = (
  columns: DbColumn[],
  filterKeyVals: { [key: string]: string },
  originalRows: RowType[]
) => {
  // The table columns definitions, but only the col which is filterable
  const filterColumns = filterCols(columns);
  filterColumns.push({
    id: 'createdAt',
    name: 'createdAt',
    type: constants.STRING,
  });
  filterColumns.push({
    id: 'updatedAt',
    name: 'updatedAt',
    type: constants.STRING,
  });
  // If every filter val is not set, return the original data
  if (
    filterColumns
      .map((column) => column.id)
      .every((colId) => !filterKeyVals[colId])
  ) {
    return originalRows;
  }

  return originalRows.filter(searchByFilter(filterColumns, filterKeyVals));
};

export const getFilteredSortedData = (
  columns: DbColumn[],
  filter: Record<string, string>,
  sorter: {
    // TODO this type is from antd
    columnKey: string;
    order: string;
  },
  rows: RowType[] | null
) => {
  const filteredData = getFilteredData(columns, filter, rows || []);
  if (sorter.columnKey && sorter.order !== undefined) {
    return getSortedData(filteredData, sorter);
  }
  return filteredData;
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

export const getInitialSorterFromUrl = () => {
  // @ts-ignore TODO
  const url = new URL(window.location);
  const sorterParam = url.searchParams.get('sorter');
  if (sorterParam && sorterParam.startsWith('{')) {
    try {
      return JSON.parse(sorterParam);
    } catch (error) {
      console.error(
        'Failed to parse sorter param from URL, sorterParam:',
        sorterParam,
        ', error:',
        error
      );
    }
  }
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
