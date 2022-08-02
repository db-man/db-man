/* eslint-disable react/prop-types, react/jsx-props-no-spreading */
import React, { useState, useEffect } from 'react';
import { Table, Input, Popconfirm, Form, Typography, Button } from 'antd';
import * as constants from '../constants';

function EditableCell({
  editing,
  dataIndex,
  title,
  record,
  index,
  children,
  ...restProps
}) {
  return /*#__PURE__*/React.createElement("td", restProps, editing ? /*#__PURE__*/React.createElement(Form.Item, {
    name: dataIndex,
    style: {
      margin: 0
    },
    rules: [{
      required: title !== 'modes',
      message: `Please Input ${title}!`
    }]
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: title === 'modes' ? 'split-table' : ''
  })) : children);
}

function EditableTable({
  onEnable
}) {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  useEffect(() => {
    const connections = localStorage.getItem(constants.LS_KEY_DB_CONNECTIONS);

    if (connections) {
      setData(JSON.parse(connections));
    }
  }, []);

  const isEditing = record => record.key === editingKey;

  const saveData = d => {
    setData(d);
    localStorage.setItem(constants.LS_KEY_DB_CONNECTIONS, JSON.stringify(d));
  };

  const handleAddRow = () => {
    const newData = [...data];
    const newRow = {
      owner: '',
      token: '',
      repo: '',
      path: '',
      modes: ''
    };
    newData.push({
      key: '0',
      // tmp row added, will delete when cancel
      ...newRow
    });
    setData(newData);
    form.setFieldsValue({ ...newRow
    });
    setEditingKey('0');
  };

  const edit = record => {
    form.setFieldsValue({
      owner: '',
      token: '',
      repo: '',
      path: '',
      modes: '',
      ...record
    });
    setEditingKey(record.key);
  };

  const cancel = record => {
    setEditingKey('');

    if (record.key === '0') {
      // Remove tmp row
      const newData = [...data];
      const index = newData.findIndex(item => item.key === '0');
      newData.splice(index, 1);
      setData(newData);
    }
  };

  const save = async key => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex(item => key === item.key);

      if (index > -1) {
        const item = newData[index];

        if (item.key === '0') {
          item.key = data.filter(({
            key: k
          }) => k !== '0').length === 0 ? '1' : Math.max(...data.filter(({
            key: k
          }) => k !== '0').map(({
            key: k
          }) => Number(k))) + 1;
        }

        newData.splice(index, 1, { ...item,
          ...row
        });
        saveData(newData);
        setEditingKey('');
      } else {
        console.log('TODO'); // eslint-disable-line no-console
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

  const handleDelete = record => {
    const newData = [...data];
    const index = newData.findIndex(item => item.key === record.key);
    newData.splice(index, 1);
    saveData(newData);
  };

  const handleEnable = record => {
    localStorage.setItem(constants.LS_KEY_GITHUB_OWNER, record.owner);
    localStorage.setItem(constants.LS_KEY_GITHUB_REPO_NAME, record.repo);
    localStorage.setItem(constants.LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN, record.token);
    localStorage.setItem(constants.LS_KEY_GITHUB_REPO_PATH, record.path);
    localStorage.setItem(constants.LS_KEY_GITHUB_REPO_MODES, record.modes);
    onEnable();
  };

  const columns = [{
    title: 'key',
    dataIndex: 'key',
    width: '10%',
    editable: false
  }, {
    title: 'owner',
    dataIndex: 'owner',
    width: '10%',
    editable: true
  }, {
    title: 'token',
    dataIndex: 'token',
    width: '10%',
    editable: true
  }, {
    title: 'repo',
    dataIndex: 'repo',
    width: '10%',
    editable: true
  }, {
    title: 'path',
    dataIndex: 'path',
    width: '10%',
    editable: true
  }, {
    title: 'modes',
    dataIndex: 'modes',
    width: '10%',
    editable: true
  }, {
    title: /*#__PURE__*/React.createElement("div", null, "Operation", ' ', /*#__PURE__*/React.createElement(Button, {
      size: "small",
      disabled: editingKey !== '',
      onClick: handleAddRow
    }, "Add")),
    dataIndex: 'operation',
    render: (_, record) => {
      const editable = isEditing(record);
      return editable ? /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Typography.Link, {
        onClick: () => save(record.key),
        style: {
          marginRight: 8
        }
      }, "Save"), /*#__PURE__*/React.createElement(Popconfirm, {
        title: "Sure to cancel?",
        onConfirm: () => cancel(record)
      }, /*#__PURE__*/React.createElement(Button, {
        type: "link"
      }, "Cancel"))) : /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Typography.Link, {
        disabled: editingKey !== '',
        onClick: () => edit(record)
      }, "Edit"), /*#__PURE__*/React.createElement(Popconfirm, {
        title: "Sure to delete?",
        onConfirm: () => handleDelete(record)
      }, /*#__PURE__*/React.createElement(Button, {
        type: "link",
        danger: true
      }, "Delete")), /*#__PURE__*/React.createElement(Button, {
        type: "link",
        onClick: () => handleEnable(record)
      }, "Enable"));
    }
  }];
  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }

    return { ...col,
      onCell: record => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    };
  });
  return /*#__PURE__*/React.createElement(Form, {
    form: form,
    component: false
  }, /*#__PURE__*/React.createElement(Table, {
    size: "small",
    components: {
      body: {
        cell: EditableCell
      }
    },
    bordered: true,
    dataSource: data,
    columns: mergedColumns,
    rowClassName: "editable-row",
    pagination: {
      onChange: cancel
    }
  }));
}

export default EditableTable;