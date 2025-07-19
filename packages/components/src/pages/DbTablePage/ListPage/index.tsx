import React, {
  ChangeEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Table,
  Input,
  Row,
  Col,
  Spin,
  Popover,
  Alert,
  message,
  Segmented,
  Typography,
} from 'antd';
import type { TableProps, ColumnType as AntdColumnType } from 'antd/es/table';
import { RightSquareFilled } from '@ant-design/icons';
// @ts-ignore TODO: fix types for lodash
import debounce from 'lodash.debounce';

import { RowType } from '../../../types/Data';
import PageContext, { PageContextType } from '../../../contexts/page';
import { getColumnRender } from '../../../ddRender/ddRender';
import * as constants from '../../../constants';
import RefTableLinks from '../../../components/RefTableLinks';
import ImageCardTable, { CardTablePagination } from './ImageCardTable';
import RandomList from '../../../components/RandomList';
import {
  findDuplicates,
  getFilteredData,
  getFilteredSortedData,
  getInitialFilter,
  updateUrl,
  getColumnSortOrder,
  getInitialSorterFromUrl,
  filterCols,
} from './helpers';

// Use `Typography` so can apply dark theme to text
const { Text } = Typography;

interface ListPageProps {
  tableName: string;
}

const defaultPage = 1;
const defaultPageSize = 10;
const debouncedUpdateUrl = debounce(updateUrl, 500);

const TableView = 'table_view';
const ImageView = 'image_view';
const RandomView = 'random_view';

const defaultTableSorter = {
  columnKey: 'createdAt', // e.g. "url"
  order: 'descend', //  "ascend" or "descend" or undefined
};

/**
 * URL params:
 * - page: number
 * - pageSize: number
 * - filter: string
 * - sorter: string
 * - view: string (table_view or image_view)
 */
const ListPage = (props: ListPageProps) => {
  const { columns, tableName, primaryKey, dbName, githubDb } =
    useContext<PageContextType>(PageContext);

  /**
   * @example filter = { url: 'https://example.com', name: 'John' }
   */
  const [filter, setFilter] = useState<Record<string, string>>({}); // getInitialFilter(filterCols()), cannot get context in constructor
  // By default, sort by createdAt in descending order
  const [sorter, setSorter] = useState(defaultTableSorter);
  const [loading, setLoading] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [rows, setRows] = useState<RowType[] | null>(null);
  const [contentTableName, setContentTableName] = useState(''); // the current table name of data this.state.rows
  // TODO to improve this part, how to get initial value from URL?
  const [page, setPage] = useState(() => {
    return (
      Number(new URL(window.location.href).searchParams.get('page')) ||
      defaultPage
    );
  });
  const [pageSize, setPageSize] = useState(() => {
    return (
      Number(new URL(window.location.href).searchParams.get('pageSize')) ||
      defaultPageSize
    );
  });
  const [view, setView] = useState(() => {
    return new URL(window.location.href).searchParams.get('view') || TableView;
  });

  const controllerRef = useRef(new AbortController());

  useEffect(() => {
    getData(tableName);
    setFilter(getInitialFilter(filterCols(columns)));
    const sorterFromUrl = getInitialSorterFromUrl();
    if (sorterFromUrl) {
      setSorter(sorterFromUrl);
    }

    return () => {
      // When your component unmounts

      // Cancel all HTTP requests in this page
      controllerRef.current.abort();
    };
  }, []);

  const filteredSortedData = getFilteredSortedData(
    columns,
    filter,
    sorter,
    rows
  );

  const handleKeyDown = (e: KeyboardEvent) => {
    // Check if the focus is on an input element
    if (document.activeElement?.tagName === 'INPUT') {
      e.stopPropagation();
      return;
    }

    if (e.key === 'ArrowRight') {
      setPage((prevPage) => {
        if (prevPage < filteredSortedData.length / pageSize) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          debouncedUpdateUrl({ page: prevPage + 1 });
          return prevPage + 1;
        } else {
          message.info('This is the last page!');
          return prevPage;
        }
      });
    } else if (e.key === 'ArrowLeft') {
      setPage((prevPage) => {
        if (prevPage > 1) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          debouncedUpdateUrl({ page: prevPage - 1 });
          return prevPage - 1;
        } else {
          message.info('This is the first page!');
          return prevPage;
        }
      });
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, false);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, false);
    };
  }, [rows]);

  useEffect(() => {
    getData(props.tableName);
  }, [props.tableName]);

  const handleFilterChange =
    (key: string) => (event: ChangeEvent<HTMLInputElement>) => {
      setFilter((prevFilter) => {
        const newFilter = {
          ...prevFilter,
          [key]: event.target.value,
        };
        debouncedUpdateUrl({ filter: newFilter });
        return newFilter;
      });
    };

  const handleTableChange: TableProps<RowType>['onChange'] = (
    pagination,
    filters,
    newSorter /* , extra */
  ) => {
    setPage(pagination.current || defaultPage);
    setPageSize(pagination.pageSize || defaultPageSize);
    setSorter({
      // @ts-ignore TODO: fix types for antd
      columnKey: newSorter.columnKey,
      // @ts-ignore TODO: fix types for antd
      order: newSorter.order, // order could be undefined
    });
    debouncedUpdateUrl({
      page: pagination.current,
      pageSize: pagination.pageSize,
      sorter: {
        // @ts-ignore TODO: fix types for antd
        columnKey: newSorter.columnKey,
        // @ts-ignore TODO: fix types for antd
        order: newSorter.order, // order could be undefined
      },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCardTableChange = (pagination: CardTablePagination) => {
    setPage(pagination.current || defaultPage);
    setPageSize(pagination.pageSize || defaultPageSize);
    debouncedUpdateUrl({
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRandomListChange = (pageSize: number) => {
    setPageSize(pageSize);
    debouncedUpdateUrl({
      pageSize,
    });
  };

  const getData = async (tableName: string) => {
    setLoading(`Loading ${dbName}/${tableName} ...`);
    try {
      const { content } = await githubDb!.getTableRows(
        dbName,
        tableName,
        controllerRef.current.signal
      );
      setRows(content);
      setContentTableName(tableName);
    } catch (error) {
      console.error('Failed to get JSON file in List component, error:', error); // eslint-disable-line no-console
      setErrMsg(`Failed to get data: ${(error as Error).message}`);
    }
    setLoading('');
  };

  const alertDuplicatedRowKey = () => {
    if (!rows) return null;
    const duplicatedRowKeys = findDuplicates(
      rows.map((item) => item[primaryKey])
    );
    if (duplicatedRowKeys.length === 0) return null;
    return (
      <div style={{ color: 'red' }}>
        Duplicated row keys(
        {duplicatedRowKeys.length}
        ): {duplicatedRowKeys.join(', ')}
      </div>
    );
  };

  const alertTableDataInvalid = () => {
    const invalidRows: RowType[] = [];
    if (!rows) return null;
    rows.forEach((row, idx) => {
      if (row[primaryKey] === undefined || row[primaryKey] === null) {
        invalidRows.push({
          rowIdx: idx,
          rowData: row,
        });
      }
    });
    if (invalidRows.length === 0) return null;
    return (
      <div style={{ color: 'red' }}>
        Invalid rows(
        {invalidRows.length}
        ):{' '}
        {invalidRows.map((row) => (
          <div>
            {`idx:${row.rowIdx}`} {JSON.stringify(row.rowData)}
          </div>
        ))}
      </div>
    );
  };

  const alertValidations = () => (
    <div className="dbm-alert-validations">
      {alertDuplicatedRowKey()}
      {alertTableDataInvalid()}
    </div>
  );

  const getTableColumns = () => {
    const cols = columns
      .filter((column) => column[constants.TYPE_LIST_PAGE] !== 'HIDE')
      .map((column) => {
        // Table component of antd
        const antdCol: AntdColumnType<RowType> = {
          key: column.id,
          title: column.name,
          dataIndex: column.id,
          // Order of sorted values: 'ascend', 'descend', false
          sortOrder: getColumnSortOrder(column.id, sorter),
          sorter: true,
          ...column.tableProps,
        };

        const renderFn = getColumnRender(constants.TYPE_LIST_PAGE, column);
        if (renderFn) {
          antdCol.render = renderFn;
        }

        if (column.referenceTable) {
          const lastRender = antdCol.render || ((val: any) => val);
          const hasVal = (val: string | string[]) => {
            if (column.type === constants.STRING_ARRAY) {
              if (!val || val.length === 0) return false;
              return true;
            }
            return !!val;
          };
          // If this column has ref table, then render links to ref table item
          antdCol.render = (...args: any /* value, record, index */) => (
            <div>
              {/* @ts-ignore TODO Ignore error: TS2556: A spread argument must either have a tuple type or be passed to a rest parameter. */}
              {lastRender(...args)}{' '}
              {hasVal(args[0]) && (
                <Popover
                  title="Ref Table Links"
                  trigger="click"
                  content={<RefTableLinks value={args[0]} column={column} />}
                >
                  <RightSquareFilled />
                </Popover>
              )}
            </div>
          );
        }

        return antdCol;
      });

    // common columns
    cols.push({
      key: 'createdAt',
      title: 'createdAt',
      dataIndex: 'createdAt',
      sortOrder: getColumnSortOrder('createdAt', sorter),
      sorter: true,
    });
    cols.push({
      key: 'updatedAt',
      title: 'updatedAt',
      dataIndex: 'updatedAt',
      sortOrder: getColumnSortOrder('updatedAt', sorter),
      sorter: true,
    });
    cols.push({
      key: 'actions',
      dataIndex: primaryKey,
      title: 'Actions',
      render: (id: string) => {
        // id is the primary key of the row, for sample case the primary key value is 'https://example.com?id=1&name=John'
        // so need to encodeURI to make it as a valid URL
        const search = `?${primaryKey}=${encodeURIComponent(id)}`;
        return (
          <div>
            <Link
              to={{
                pathname: `/${dbName}/${tableName}/update`,
                search,
              }}
            >
              Update
            </Link>{' '}
            |{' '}
            <Link
              to={{
                pathname: `/${dbName}/${tableName}/get`,
                search,
              }}
            >
              Detail
            </Link>
          </div>
        );
      },
    });
    return cols;
  };

  const renderTable = () => {
    // When router changed, before loading next table rows,
    // contentTableName is old table, but this.props.tableName is new table.
    if (contentTableName !== tableName) return null;
    return (
      <div>
        {alertValidations()}
        <Table
          size="small"
          showSorterTooltip={false}
          rowKey={primaryKey}
          columns={getTableColumns()}
          dataSource={filteredSortedData}
          pagination={{
            current: page,
            pageSize,
            // total: filteredSortedData.length,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
          }}
          onChange={handleTableChange}
        />
      </div>
    );
  };

  const renderTableViewOrImageView = () => {
    if (loading) return <Spin tip={loading}>Loading...</Spin>;
    if (errMsg) return <Alert message={errMsg} type="error" />;
    if (!rows) return null;

    switch (view) {
      case TableView:
        return renderTable();
      case ImageView:
        return (
          <ImageCardTable
            imgKey={
              columns.find((col) => col['ui:listPage:isImageViewKey'])?.id
            }
            dataSource={filteredSortedData}
            pagination={{
              current: page,
              pageSize,
            }}
            onChange={handleCardTableChange}
          />
        );
      case RandomView:
        return (
          <RandomList
            rows={getFilteredData(columns, filter, rows)}
            pageSize={pageSize}
            onChange={handleRandomListChange}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="dbm-list-page list-component">
      <div className="dbm-table-filter">
        <Row gutter={10}>
          {[
            ...filterCols(columns),
            { id: 'createdAt', name: 'createdAt' },
            { id: 'updatedAt', name: 'updatedAt' },
          ].map((f) => (
            <Col key={f.id} span={6}>
              <Text>{f.name}</Text>
              :
              <Input
                size="small"
                value={filter[f.id]}
                onChange={handleFilterChange(f.id)}
              />
            </Col>
          ))}
        </Row>
      </div>
      <Segmented
        value={view}
        options={[
          {
            label: 'Table View',
            value: TableView,
          },
          {
            label: 'Image View',
            value: ImageView,
          },
          {
            label: 'Random View',
            value: RandomView,
          },
        ]}
        onChange={(val) => {
          setView(val + '');
          debouncedUpdateUrl({ view: val });
        }}
      />
      {renderTableViewOrImageView()}
    </div>
  );
};

export default ListPage;

ListPage.propTypes = {
  // Even tableName is now passing from context,
  // but we need to pass props.tableName to get new data from backend API
  tableName: PropTypes.string.isRequired,
};
