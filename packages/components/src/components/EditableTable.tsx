/* eslint-disable react/prop-types, react/jsx-props-no-spreading */

import React, { useState, useEffect } from 'react';
import { Table, Input, Popconfirm, Form, Typography, Button } from 'antd';

import { CheckCircleOutlined } from '@ant-design/icons';
import * as constants from '../constants';
import { StorageType } from './DbConnections';

type TableRowType = {
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
              required: title !== 'modes',
              message: `Please Input ${title}!`,
            },
          ]}
        >
          <Input placeholder={title === 'modes' ? 'split-table' : ''} />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
}

function EditableTable({
  storage,
  onEnable,
}: {
  storage: StorageType;
  onEnable: () => void;
}) {
  const [form] = Form.useForm();
  const [data, setData] = useState<TableRowType[]>([]);
  const [editingKey, setEditingKey] = useState('');

  useEffect(() => {
    const connections = storage.get(constants.LS_KEY_DB_CONNECTIONS);
    if (connections) {
      setData(JSON.parse(connections));
    }
  }, []);

  const isEditing = (record: TableRowType) => record.key === editingKey;

  const saveData = (d: TableRowType[]) => {
    setData(d);
    storage.set(constants.LS_KEY_DB_CONNECTIONS, JSON.stringify(d));
  };

  const handleAddRow = () => {
    const newData = [...data];
    const newRow = {
      owner: '',
      token: '',
      repo: '',
      path: '',
      modes: '',
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
      owner: '',
      token: '',
      repo: '',
      path: '',
      modes: '',
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
    storage.set(constants.LS_KEY_GITHUB_OWNER, record.owner);
    storage.set(constants.LS_KEY_GITHUB_REPO_NAME, record.repo);
    storage.set(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN, record.token);
    storage.set(constants.LS_KEY_GITHUB_REPO_PATH, record.path);
    storage.set(constants.LS_KEY_GITHUB_REPO_MODES, record.modes);
    onEnable();
  };

  const columns = [
    {
      title: 'key',
      dataIndex: 'key',
      width: '10%',
      editable: false,
    },
    {
      title: 'owner',
      dataIndex: 'owner',
      width: '10%',
      editable: true,
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
      title: 'repo',
      dataIndex: 'repo',
      width: '10%',
      editable: true,
    },
    {
      title: 'path',
      dataIndex: 'path',
      width: '10%',
      editable: true,
    },
    {
      title: 'modes',
      dataIndex: 'modes',
      width: '10%',
      editable: true,
    },
    {
      title: (
        <div>
          Operation{' '}
          <Button
            size='small'
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
              onClick={() => save(record.key)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </Typography.Link>
            <Popconfirm
              title='Sure to cancel?'
              onConfirm={() => cancel(record)}
            >
              <Button type='link'>Cancel</Button>
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
              title='Sure to delete?'
              onConfirm={() => handleDelete(record)}
            >
              <Button type='link' danger>
                Delete
              </Button>
            </Popconfirm>
            <Button type='link' onClick={() => handleEnable(record)}>
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
      return {
        ...col,
        render: (text: string, record: TableRowType) => {
          if (
            record.owner === storage.get(constants.LS_KEY_GITHUB_OWNER) &&
            record.repo === storage.get(constants.LS_KEY_GITHUB_REPO_NAME)
          ) {
            return (
              <span>
                {text} <CheckCircleOutlined />
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
        size='small'
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowClassName='editable-row'
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
