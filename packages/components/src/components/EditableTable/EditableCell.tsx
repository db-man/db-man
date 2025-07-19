import { Input, Form, Checkbox, Select } from 'antd';

function EditableCell({
  editing,
  dataIndex,
  title,
  record,
  index,
  children,
  'ui:type': uiType,
  'ui:options': uiOptions,
  'form:required': formRequired,
  'form:valueType': formValueType,
  ...restProps
}: {
  editing: boolean;
  dataIndex: string;
  title: string;
  record: any;
  index: number;
  children: any;
  'ui:type': string;
  'ui:options': { label: string; value: string }[];
  'form:required': boolean;
  'form:valueType': string;
}) {
  let input = (
    <Input
      className={`dbm-editable-table-new-row-editable-cell-title--${title}`}
      placeholder=""
    />
  );
  let valuePropName = undefined;
  if (uiType === 'checkbox') {
    input = <Checkbox />;
    valuePropName = 'checked';
  }
  if (uiType === 'select') {
    input = <Select options={uiOptions} />;
    // valuePropName = 'value';
  }

  let childrenEl = children;
  if (uiType === 'checkbox') {
    childrenEl = (
      <Checkbox checked={children && children[1] === true} disabled />
    );
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          valuePropName={valuePropName}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: formRequired,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {input}
        </Form.Item>
      ) : (
        childrenEl
      )}
    </td>
  );
}

export default EditableCell;
