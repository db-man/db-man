import React, { useContext } from 'react';
import { message, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import StringFormFieldValue, { InputProps } from './StringFormFieldValue';
import RefTableLink from './RefTableLink';
import PageContext from '../contexts/page';
import PresetsButtons from './PresetsButtons';
import DbColumn from '../types/DbColumn';
import { useAppContext } from '../contexts/AppContext';
import { FieldValueWarning } from './FormValidations';
import { checkFieldValue, validatePrimaryKey } from './Form/helpers';
import { RowType } from '../types/Data';

type OnChangeType = (
  value: string,
  event:
    | React.ChangeEvent<HTMLInputElement> // for antd.Input
    | React.MouseEvent<HTMLElement> // for antd.Button
) => void;

interface StringFormFieldProps {
  column: DbColumn;
  rows: RowType[];
  value?: string;
  inputProps?: InputProps;
  preview?: boolean;
  onChange: OnChangeType;
}

const popoverContent = (
  <div>
    <p>
      When db mode is split-table, single record will be created as a file on
      filesystem.
      <br />
      But on some filesystem, e.g. macOS or Linux, the filename length limit is
      255.
      <br />
      So we need to check the length of filename, and warn user if it is too
      long.
    </p>
  </div>
);

/**
 * To render a form field for table_column.type="STRING"
 */
export default function StringFormField(props: StringFormFieldProps) {
  const { column, value, inputProps, preview, onChange } = props;
  const appCtx = useAppContext();
  const pageCtx = useContext(PageContext);

  const warnPrimaryKeyInvalid = (value: string) =>
    message.warning(
      <div>
        Found duplicated item in db{' '}
        <a
          href={`/${pageCtx.dbName}/${pageCtx.tableName}/update?${pageCtx.primaryKey}=${value}`}
        >
          {value}
        </a>
      </div>,
      10
    );

  const handleChange: OnChangeType = (val, evt) => {
    onChange(val, evt);

    // When db mode is split-table, download the (big) table file will take a long time.
    // So will not check about duplicated item, cause we don't have the full table data.
    if (!pageCtx.appModes.includes('split-table')) {
      // validate the primary field in form, e.g. duplication check
      // TODO maybe do this in antd Form component
      // TODO why do we assume the type of primary column in a table is always `string`?
      if (column.id === pageCtx.primaryKey) {
        if (!validatePrimaryKey(val, props.rows, pageCtx.primaryKey)) {
          warnPrimaryKeyInvalid(val);
        }
      }
    } else {
      const errMsg = checkFieldValue({
        column,
        primaryKey: pageCtx.primaryKey,
        value: val,
      });
      if (errMsg) {
        message.warning(errMsg, 10);
      }
    }
  };

  return (
    <div className='dbm-form-field dbm-string-form-field'>
      <b>{column.name}</b>:{' '}
      {pageCtx.appModes.includes('split-table') &&
        column.id === pageCtx.primaryKey && (
          <>
            <Popover content={popoverContent} title='Primary Key Info'>
              <QuestionCircleOutlined />
            </Popover>{' '}
          </>
        )}
      <PresetsButtons column={column} onChange={handleChange} />{' '}
      <RefTableLink
        column={column}
        tables={appCtx.getTablesByDbName(pageCtx.dbName)}
        dbName={pageCtx.dbName}
        value={value}
      />
      <FieldValueWarning
        expectedTypes={['string', 'undefined']}
        value={value}
      />
      <StringFormFieldValue
        inputProps={{
          ...inputProps,
          status: checkFieldValue({
            column,
            primaryKey: pageCtx.primaryKey,
            value: value || '',
          })
            ? 'error'
            : undefined,
        }}
        preview={preview}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
