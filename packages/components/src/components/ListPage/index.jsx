import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Table, Input, Row, Col, Spin, Popover, Alert,
} from 'antd';
import { RightSquareFilled } from '@ant-design/icons';
import debounce from 'lodash.debounce';
import { githubDb } from '@db-man/github';

import PageContext from '../../contexts/page';
import { getColumnRender } from '../../ddRender/ddRender';

import {
  findDuplicates,
  getFilteredData,
  getSortedData,
  getInitialFilter,
  updateUrl,
  getColumnSortOrder,
  getInitialSorter,
} from './helpers';
import RefTableLinks from '../RefTableLinks';
import * as constants from '../../constants';

const defaultPage = 1;
const defaultPageSize = 10;
const debouncedUpdateUrl = debounce(updateUrl, 500);

export default class ListPage extends React.Component {
  constructor(props) {
    super(props);

    const url = new URL(window.location);
    this.state = {
      filter: {}, // getInitialFilter(this.filterCols), cannot get context in constructor
      sorter: {
        columnKey: '', // e.g. "url"
        order: '', //  "ascend" or "descend" or undefined
      },
      loading: '',
      errMsg: '',
      rows: null,
      contentTableName: '', // the current table name of data this.state.rows
      page: Number(url.searchParams.get('page')) || defaultPage,
      pageSize: Number(url.searchParams.get('pageSize')) || defaultPageSize,
    };

    this.controller = new AbortController();
  }

  componentDidMount() {
    const { tableName } = this.context;
    this.getData(tableName);
    this.setState({
      filter: getInitialFilter(this.filterCols),
      sorter: getInitialSorter(),
    });
  }

  componentDidUpdate(prevProps) {
    const { tableName } = this.props;
    if (tableName !== prevProps.tableName) {
      this.getData(tableName);
    }
  }

  componentWillUnmount() {
    // Cancel all HTTP requests in this page
    this.controller.abort();
  }

  handleFilterChange = (key) => (event) => {
    const { filter } = this.state;
    this.updateState({
      filter: {
        ...filter,
        [key]: event.target.value,
      },
    });
  };

  handleTableChange = (pagination, filters, sorter /* , extra */) => {
    const { current, pageSize } = pagination;
    this.updateState({
      page: current,
      pageSize,
      sorter: {
        columnKey: sorter.columnKey,
        order: sorter.order, // order could be undefined
      },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  get filteredSortedData() {
    const { filter, sorter, rows } = this.state;
    const filteredData = getFilteredData(
      this.filterCols,
      filter,
      rows,
    );
    if (sorter.columnKey && sorter.order !== undefined) {
      return getSortedData(filteredData, sorter);
    }
    return filteredData;
  }

  get filterCols() {
    const { columns } = this.context;
    return columns.filter((col) => col.filter);
  }

  getData = async (tableName) => {
    const { dbName } = this.context;
    this.setState({ loading: `Loading ${dbName}/${tableName} ...` });
    try {
      const { content } = await githubDb.getTableRows(
        dbName,
        tableName,
        this.controller.signal,
      );
      this.setState({
        rows: content,
        contentTableName: tableName,
      });
    } catch (error) {
      console.error('Failed to get JSON file in List component, error:', error); // eslint-disable-line no-console
      this.setState({ errMsg: `Failed to get data: ${error.message}` });
    }
    this.setState({ loading: '' });
  };

  // Update React states and URL states
  updateState = (states) => {
    this.setState({ ...states });
    debouncedUpdateUrl(states);
  };

  alertDuplicatedRowKey = () => {
    const { rows } = this.state;
    const { primaryKey } = this.context;
    const duplicatedRowKeys = findDuplicates(
      rows.map((item) => item[primaryKey]),
    );
    if (duplicatedRowKeys.length === 0) return null;
    return (
      <div style={{ color: 'red' }}>
        Duplicated row keys(
        {duplicatedRowKeys.length}
        ):
        {' '}
        {duplicatedRowKeys.join(', ')}
      </div>
    );
  };

  alertTableDataInvalid = () => {
    const { rows } = this.state;
    const { primaryKey } = this.context;
    const invalidRows = [];
    rows.forEach(
      (row, idx) => {
        if (row[primaryKey] === undefined || row[primaryKey] === null) {
          invalidRows.push({
            rowIdx: idx,
            rowData: row,
          });
        }
      },
    );
    if (invalidRows.length === 0) return null;
    return (
      <div style={{ color: 'red' }}>
        Invalid rows(
        {invalidRows.length}
        ):
        {' '}
        {invalidRows.map((row) => (
          <div>
            {`idx:${row.rowIdx}`}
            {' '}
            {JSON.stringify(row.rowData)}
          </div>
        ))}
      </div>
    );
  };

  alertValidations = () => (
    <div className="dm-alert-validations">
      {this.alertDuplicatedRowKey()}
      {this.alertTableDataInvalid()}
    </div>
  );

  getTableColumns = () => {
    const { sorter } = this.state;
    const {
      columns, primaryKey, dbName, tableName,
    } = this.context;

    const cols = columns
      .filter((column) => column['type:listPage'] !== 'HIDE')
      .map((column) => {
        // Table component of antd
        const antdCol = {
          key: column.id,
          title: column.name,
          dataIndex: column.id,
          // Order of sorted values: 'ascend', 'descend', false
          sortOrder: getColumnSortOrder(column.id, sorter),
          sorter: true,
          ...column.tableProps,
        };

        const renderFn = getColumnRender(column);
        if (renderFn) {
          antdCol.render = renderFn;
        }

        if (column.referenceTable) {
          const lastRender = antdCol.render || ((val) => val);
          const hasVal = (val) => {
            if (column.type === constants.STRING_ARRAY) {
              if (!val || val.length === 0) return false;
              return true;
            }
            return !!val;
          };
          // If this column has ref table, then render links to ref table item
          antdCol.render = (...args/* value, record, index */) => (
            <div>
              {lastRender(...args)}
              {' '}
              {hasVal(args[0])
                && (
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
      render: (id) => (
        <div>
          <Link
            to={{
              pathname: `/${dbName}/${tableName}/update`,
              search: `?${primaryKey}=${id}`,
            }}
          >
            Update
          </Link>
          |
          <Link
            to={{
              pathname: `/${dbName}/${tableName}/get`,
              search: `?${primaryKey}=${id}`,
            }}
          >
            Detail
          </Link>
        </div>
      ),
    });
    return cols;
  };

  renderTable = () => {
    const {
      loading, rows, contentTableName, page, pageSize, errMsg,
    } = this.state;
    const { tableName, primaryKey } = this.context;
    if (loading) return <Spin tip={loading} />;
    if (errMsg) return <Alert message={errMsg} type="error" />;
    if (!rows) return null;
    // When router changed, before loading next table rows,
    // contentTableName is old table, but this.props.tableName is new table.
    if (contentTableName !== tableName) return null;
    return (
      <div>
        {this.alertValidations()}
        <Table
          size="small"
          rowKey={primaryKey}
          columns={this.getTableColumns()}
          dataSource={this.filteredSortedData}
          pagination={{
            current: page,
            pageSize,
            // total: this.filteredSortedData.length,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
          }}
          onChange={this.handleTableChange}
        />
      </div>
    );
  };

  render() {
    const { filter } = this.state;
    return (
      <div className="dm-list-page list-component">
        <div className="table-filter">
          <Row gutter={10}>
            {this.filterCols.map((f) => (
              <Col key={f.id} span={6}>
                {f.name}
                :
                <Input
                  size="small"
                  value={filter[f.id]}
                  onChange={this.handleFilterChange(f.id)}
                />
              </Col>
            ))}
          </Row>
        </div>
        {this.renderTable()}
      </div>
    );
  }
}

ListPage.propTypes = {
  // Even tableName is now passing from context,
  // but we need to pass props.tableName to get new data from backend API
  tableName: PropTypes.string.isRequired,
};

ListPage.contextType = PageContext;
