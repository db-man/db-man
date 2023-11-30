import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Input, Popover, Button } from 'antd';
import { RowType } from '../types/Data';

export default function ErrorAlert({
  json,
  error,
  tplStr,
  record,
}: {
  json: string;
  error: { message: string };
  tplStr: string;
  record: RowType;
}) {
  return (
    <Alert
      message={
        <div>
          {`Failed to parse JSON generated from template, fallback to render plain text. `}
          <Popover
            content={
              <div style={{ width: '800px' }}>
                <div>Error: {error.message}</div>
                <div>
                  {`The generated JSON (Copy the JSON to do the validation):`}
                  <Input.TextArea defaultValue={json} />
                </div>
                <div>
                  tplStr: <Input.TextArea defaultValue={tplStr} />
                </div>
                <div>
                  record:{' '}
                  <Input.TextArea
                    rows={7}
                    defaultValue={JSON.stringify(record, null, 2)}
                  />
                </div>
              </div>
            }
            title='Debug Info'
            trigger='click'
          >
            <Button size='small' danger>
              Debug Info
            </Button>
          </Popover>
        </div>
      }
      type='error'
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
