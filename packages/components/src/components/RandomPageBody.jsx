/* eslint-disable react/destructuring-assignment, no-console, max-len */

import React from 'react';
import { Link } from 'react-router-dom';
import { List, Card } from 'antd';
import { githubDb } from '@db-man/github';

// import { contexts as PageContext, ddRender } from '@db-man/components';
import PageContext from '../contexts/page';
import * as ddRender from '../ddRender/ddRender';

const listGrid = {
  gutter: 16,
  xs: 1,
  sm: 2,
  md: 4,
  lg: 4,
  xl: 4,
  xxl: 3,
};
const getAny = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomItems = (rows) => {
  const randomItems = [];
  for (let i = 0; i < 8; i += 1) {
    randomItems.push(getAny(rows));
  }
  return randomItems;
};

export default class RandomPageBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: null,
    };
  }

  componentDidMount() {
    this.getDataAsync();
  }

  getDataAsync = async () => {
    try {
      const { content } = await githubDb.getTableRows(
        this.context.dbName,
        this.context.tableName,
      );
      this.setState({
        content,

      });
    } catch (error) {
      console.error(
        'Failed to get JSON file in RandomPageBody component, error:',
        error,
      );
    }
  };

  renderItem = (item) => {
    const { primaryKey } = this.context;
    const column = this.context.columns.find((col) => col.id === primaryKey);
    const args = column['type:randomPage'];
    const fn = ddRender.getRender(args) || ((val) => val);
    return (
      <List.Item>
        <Card>
          <div>{fn(item[primaryKey], item, 0)}</div>
          <Link
            to={{
              pathname: `/${this.context.dbName}/${this.context.tableName}/update`,
              search: `?${primaryKey}=${item[primaryKey]}`,
            }}
          >
            Update
          </Link>
        </Card>
      </List.Item>
    );
  };

  renderList = () => {
    const { content } = this.state;
    if (!content) return null;

    return (
      <List
        grid={listGrid}
        dataSource={getRandomItems(content)}
        renderItem={this.renderItem}
      />
    );
  };

  render() {
    return (
      <div className="random-page-body-component">{this.renderList()}</div>
    );
  }
}

RandomPageBody.contextType = PageContext;
