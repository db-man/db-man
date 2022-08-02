/* eslint-disable react/destructuring-assignment, no-console, max-len */

import React from 'react';
import PropTypes from 'prop-types';
import { Input, Collapse } from 'antd';

import PageContext from '../../contexts/page';
import * as constants from '../../constants';
import * as ddRender from '../../ddRender/ddRender';
import FieldWrapper from '../FieldWrapper';
import StringFormFieldValue from '../StringFormFieldValue';

const { Panel } = Collapse;

export default class Detail extends React.Component {
  renderWithDdRender = (column, value) => {
    const renderFn = ddRender.getDetailPageColumnRender(column, {
      column,
      tables: this.context.tables,
      rows: this.props.refTables[`ref:${column.referenceTable}:rows`], // eslint-disable-line react/prop-types
    });
    if (renderFn) {
      const el = renderFn(value, this.props.defaultValues);
      if (el) {
        return el;
      }
    }
    return (
      <div>
        No render fn:
        {' '}
        {value}
      </div>
    );
  };

  renderStringFieldValue = (column) => {
    const value = this.props.defaultValues[column.id];

    if (column['type:getPage']) {
      return this.renderWithDdRender(column, value);
    }

    let preview = false;
    if (column['type:getPage'] === 'WithPreview') {
      preview = true;
    }
    return (
      <StringFormFieldValue
        key={column.id}
        inputProps={{
          readOnly: true,
        }}
        preview={preview}
        value={value}
      />
    );
  };

  renderFieldValue = (column) => {
    switch (column.type) {
      case constants.STRING:
        return this.renderStringFieldValue(column);
      case constants.BOOL:
      case constants.NUMBER:
      case constants.STRING_ARRAY:
      default:
        return this.renderWithDdRender(column, this.props.defaultValues[column.id]);
    }
  };

  renderDebugJson = () => {
    const debugJson = JSON.stringify(this.props.defaultValues, null, '  ');
    return (
      <Collapse>
        <Panel header="Debug JSON" key="1">
          <Input.TextArea
            style={{ fontSize: '10px' }}
            rows={debugJson.split('\n').length}
            value={debugJson}
          />
        </Panel>
      </Collapse>
    );
  };

  render() {
    const { columns } = this.context;

    return (
      <div className="get-page-body-detail-component">
        <div>
          {columns.map((column) => (
            <FieldWrapper
              key={column.id}
              column={column}
              value={this.props.defaultValues[column.id]}
            >
              {this.renderFieldValue(column)}
            </FieldWrapper>
          ))}
        </div>
        {this.renderDebugJson()}
      </div>
    );
  }
}

Detail.propTypes = {
  defaultValues: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

Detail.defaultProps = {};

Detail.contextType = PageContext;
