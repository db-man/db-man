import React from 'react';
import PropTypes from 'prop-types';
import { Input, message } from 'antd';

export default class JsonEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jsonStr: JSON.stringify(props.value, null, '  '),
    };
  }

  handleChange = (event) => {
    const { value } = event.target;
    const { onChange } = this.props;

    try {
      const obj = JSON.parse(value);
      onChange(obj);
    } catch (error) {
      message.error(
        `There is something wrong in JSON text, detail: ${error.message}`,
      );
    }

    this.setState({ jsonStr: value });
  };

  render() {
    const { jsonStr } = this.state;
    return (
      <Input.TextArea
        autoSize
        value={jsonStr}
        onChange={this.handleChange}
      />
    );
  }
}

JsonEditor.propTypes = {
  value: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onChange: PropTypes.func.isRequired,
};
