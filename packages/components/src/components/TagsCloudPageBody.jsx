/* eslint-disable react/destructuring-assignment, no-console, max-len */

import React from 'react';
import { Link } from 'react-router-dom';
import { List } from 'antd';
import { githubDb } from '@db-man/github';

import PageContext from '../contexts/page';

export default class TagsCloudPageBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      content: [],
    };
  }

  componentDidMount() {
    this.getDataAsync();
  }

  getDataAsync = async () => {
    try {
      this.setState({ loading: true });
      const { content } = await githubDb.getTableRows(
        this.context.dbName,
        this.context.tableName,
      );
      this.setState({
        loading: false,
        content,

      });
    } catch (error) {
      this.setState({ loading: false });
      console.error(
        'Failed to get JSON file in TagsCloudPageBody component, error:',
        error,
      );
    }
  };

  renderList = () => {
    const { content } = this.state;
    if (!content) return null;

    // tag name <=> tag count
    const tagNameCount = {};
    content.forEach((item) => {
      if (!item.tags) return;
      item.tags.forEach((name) => {
        if (!tagNameCount[name]) {
          tagNameCount[name] = 0;
        }
        tagNameCount[name] += 1;
      });
    });

    const dataSource = Object.keys(tagNameCount)
      .map((name) => ({
        name,
        count: tagNameCount[name],
      }))
      .sort((a, b) => b.count - a.count);

    return (
      <List
        loading={this.state.loading}
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 4,
          lg: 4,
          xl: 8,
          xxl: 3,
        }}
        dataSource={dataSource}
        renderItem={(item) => {
          const filter = encodeURIComponent(
            JSON.stringify({
              tags: item.name,
            }),
          );
          return (
            <List.Item>
              <div className="tags-cloud-item">
                <Link
                  to={{
                    pathname: `/${this.context.dbName}/${this.context.tableName}/list`,
                    search: `?filter=${filter}`,
                  }}
                >
                  {item.name}
                </Link>
                {' '}
                :
                {' '}
                {item.count}
              </div>
            </List.Item>
          );
        }}
      />
    );
  };

  render() {
    return (
      <div className="tags-cloud-page-body-component">{this.renderList()}</div>
    );
  }
}

TagsCloudPageBody.contextType = PageContext;
