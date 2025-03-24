/* eslint-disable react/prop-types, react/jsx-props-no-spreading */

import React, { useState } from 'react';

import { CheckCircleOutlined } from '@ant-design/icons';
import { Table, Input, Popconfirm, Form, Typography, Button } from 'antd';

export type TableRowType = {
  [key: string]: string;
};

function EditableCell({
  editing,
  dataIndex,
  title,
  record,
  index,
  children,
  ...restProps
}: {
  editing: boolean;
  dataIndex: string;
  title: string;
  record: any;
  index: number;
  children: any;
}) {
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          <Input
            className={`dbm-new-connection-editable-cell-title-${title}`}
            placeholder=""
          />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
}

function EditableTable({
  defaultData,
  onEnable,
  onSave,
  isConnectionEnabled,
}: {
  defaultData: TableRowType[];
  onEnable: (record: TableRowType) => void;
  onSave: (data: TableRowType[]) => void;
  isConnectionEnabled: (record: TableRowType) => boolean;
}) {
  const [form] = Form.useForm();
  const [data, setData] = useState<TableRowType[]>(defaultData);
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record: TableRowType) => record.key === editingKey;

  const saveData = (d: TableRowType[]) => {
    setData(d);
    onSave(d);
  };

  const handleAddRow = () => {
    const newData = [...data];
    const newRow = {
      token: '',
      owner: '',
      repo: '',
    };
    newData.push({
      key: '0', // tmp row added, will delete when cancel
      ...newRow,
    });
    setData(newData);
    form.setFieldsValue({
      ...newRow,
    });
    setEditingKey('0');
  };

  const edit = (record: TableRowType) => {
    form.setFieldsValue({
      token: '',
      owner: '',
      repo: '',
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = (record: TableRowType) => {
    setEditingKey('');
    if (record.key === '0') {
      // Remove tmp row
      const newData = [...data];
      const index = newData.findIndex((item) => item.key === '0');
      newData.splice(index, 1);
      setData(newData);
    }
  };

  const save = async (key: string) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        if (item.key === '0') {
          item.key =
            data.filter(({ key: k }) => k !== '0').length === 0
              ? '1'
              : Math.max(
                  ...data
                    .filter(({ key: k }) => k !== '0')
                    .map(({ key: k }) => Number(k))
                ) +
                1 +
                '';
        }
        newData.splice(index, 1, { ...item, ...row });
        saveData(newData);
        setEditingKey('');
      } else {
        alert('TODO');
        // newData.push({
        //   ...row,
        //   key: data.length === 0 ? 1 : Math.max(...data.map(({ key: k }) => k)) + 1,
        // });
        // setData(newData);
        // setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo); // eslint-disable-line no-console
    }
  };

  const handleDelete = (record: TableRowType) => {
    const newData = [...data];
    const index = newData.findIndex((item) => item.key === record.key);
    newData.splice(index, 1);
    saveData(newData);
  };

  const handleEnable = (record: TableRowType) => {
    onEnable(record);
  };

  const columns = [
    {
      title: 'key',
      dataIndex: 'key',
      width: '10%',
      editable: false,
    },
    {
      title: 'token',
      dataIndex: 'token',
      width: '10%',
      render: (token: string) => (
        <textarea
          style={{ resize: 'none' }}
          rows={1}
          cols={10}
          disabled
          defaultValue={token}
        />
      ),
      editable: true,
    },
    {
      title: 'owner',
      dataIndex: 'owner',
      width: '10%',
      editable: true,
    },
    {
      title: 'repo',
      dataIndex: 'repo',
      width: '10%',
      editable: true,
    },
    {
      title: (
        <div>
          Operation{' '}
          <Button
            className="dbm-create-connection-btn"
            size="small"
            disabled={editingKey !== ''}
            onClick={handleAddRow}
          >
            Add
          </Button>
        </div>
      ),
      dataIndex: 'operation',
      render: (_: any, record: TableRowType) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              className="dbm-save-connection-link"
              style={{
                marginRight: 8,
              }}
              onClick={() => save(record.key)}
            >
              Save
            </Typography.Link>
            <Popconfirm
              title="Sure to cancel?"
              onConfirm={() => cancel(record)}
            >
              <Button type="link">Cancel</Button>
            </Popconfirm>
          </span>
        ) : (
          <span>
            <Typography.Link
              disabled={editingKey !== ''}
              onClick={() => edit(record)}
            >
              Edit
            </Typography.Link>
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record)}
            >
              <Button type="link" danger>
                Delete
              </Button>
            </Popconfirm>
            <Button
              className="dbm-enable-connection-btn"
              type="link"
              onClick={() => handleEnable(record)}
            >
              Enable
            </Button>
          </span>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      if (col.dataIndex !== 'key') {
        return col;
      }
      // render the "key" column with a check icon if it's the current connection
      return {
        ...col,
        render: (text: string, record: TableRowType) => {
          if (isConnectionEnabled(record)) {
            return (
              <span>
                {text} <CheckCircleOutlined style={{ color: 'red' }} />
              </span>
            );
          }
          return text;
        },
      };
    }

    return {
      ...col,
      onCell: (record: TableRowType) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <Form form={form} component={false}>
      <Table
        size="small"
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={
          {
            // onChange: cancel,
          }
        }
      />
    </Form>
  );
}

export default EditableTable;
