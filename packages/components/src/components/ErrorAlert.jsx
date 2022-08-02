import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Input, Popover, Button,
} from 'antd';

export default function ErrorAlert({
  json, error, tplStr, record,
}) {
  return (
    <Alert
      message={(
        <div>
          Failed to parse JSON generated from template, fallback to render plain
          text.
          <div>
            The generated JSON:
            <Input.TextArea defaultValue={json} />
          </div>
          <Popover
            content={(
              <div style={{ width: '800px' }}>
                <div>
                  Error:
                  {error.message}
                </div>
                <div>
                  tplStr:
                  {' '}
                  <Input.TextArea defaultValue={tplStr} />
                </div>
                <div>
                  record:
                  {' '}
                  <Input.TextArea
                    rows={7}
                    defaultValue={JSON.stringify(record, null, 2)}
                  />
                </div>
              </div>
            )}
            title="Debug Info"
            trigger="click"
          >
            <Button danger>Debug Info</Button>
          </Popover>
        </div>
      )}
      type="error"
      closable
    />
  );
}
ErrorAlert.propTypes = {
  json: PropTypes.string.isRequired,
  error: PropTypes.shape({ message: PropTypes.string }).isRequired,
  tplStr: PropTypes.string.isRequired,
  record: PropTypes.string.isRequired,
};
