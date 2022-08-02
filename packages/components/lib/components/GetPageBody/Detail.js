function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* eslint-disable react/destructuring-assignment, no-console, max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { Input, Collapse } from 'antd';
import PageContext from '../../contexts/page';
import * as constants from '../../constants';
import * as ddRender from '../../ddRender/ddRender';
import FieldWrapper from '../FieldWrapper';
import StringFormFieldValue from '../StringFormFieldValue';
const {
  Panel
} = Collapse;
export default class Detail extends React.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "renderWithDdRender", (column, value) => {
      const renderFn = ddRender.getDetailPageColumnRender(column, {
        column,
        tables: this.context.tables,
        rows: this.props.refTables[`ref:${column.referenceTable}:rows`] // eslint-disable-line react/prop-types

      });

      if (renderFn) {
        const el = renderFn(value, this.props.defaultValues);

        if (el) {
          return el;
        }
      }

      return /*#__PURE__*/React.createElement("div", null, "No render fn:", ' ', value);
    });

    _defineProperty(this, "renderStringFieldValue", column => {
      const value = this.props.defaultValues[column.id];

      if (column['type:getPage']) {
        return this.renderWithDdRender(column, value);
      }

      let preview = false;

      if (column['type:getPage'] === 'WithPreview') {
        preview = true;
      }

      return /*#__PURE__*/React.createElement(StringFormFieldValue, {
        key: column.id,
        inputProps: {
          readOnly: true
        },
        preview: preview,
        value: value
      });
    });

    _defineProperty(this, "renderFieldValue", column => {
      switch (column.type) {
        case constants.STRING:
          return this.renderStringFieldValue(column);

        case constants.BOOL:
        case constants.NUMBER:
        case constants.STRING_ARRAY:
        default:
          return this.renderWithDdRender(column, this.props.defaultValues[column.id]);
      }
    });

    _defineProperty(this, "renderDebugJson", () => {
      const debugJson = JSON.stringify(this.props.defaultValues, null, '  ');
      return /*#__PURE__*/React.createElement(Collapse, null, /*#__PURE__*/React.createElement(Panel, {
        header: "Debug JSON",
        key: "1"
      }, /*#__PURE__*/React.createElement(Input.TextArea, {
        style: {
          fontSize: '10px'
        },
        rows: debugJson.split('\n').length,
        value: debugJson
      })));
    });
  }

  render() {
    const {
      columns
    } = this.context;
    return /*#__PURE__*/React.createElement("div", {
      className: "get-page-body-detail-component"
    }, /*#__PURE__*/React.createElement("div", null, columns.map(column => /*#__PURE__*/React.createElement(FieldWrapper, {
      key: column.id,
      column: column,
      value: this.props.defaultValues[column.id]
    }, this.renderFieldValue(column)))), this.renderDebugJson());
  }

}
Detail.propTypes = {
  defaultValues: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types

};
Detail.defaultProps = {};
Detail.contextType = PageContext;