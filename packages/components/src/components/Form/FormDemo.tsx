import PageContext from 'contexts/page';
import Form from '.';
import DbTable from '../../types/DbTable';

const { Provider } = PageContext;
const tables: DbTable[] = [
  {
    name: 'users',
    description: 'users table',
    columns: [
      {
        id: 'userId',
        name: 'User ID',
        type: 'NUMBER',
        primary: true,
        description: 'An unique user ID',
      },
      {
        id: 'name',
        name: 'Name',
        type: 'STRING',
        description: 'The name of the user',
        'ui:createUpdatePage:placeholder': 'Enter Name',
      },
      {
        id: 'roleCode',
        name: 'Role Code',
        type: 'STRING',
        description: 'The role code of the user',
        referenceTable: 'roles',
        'ui:createUpdatePage:enum': ['maintainer', 'developer'],
      },
      {
        id: 'maleOrFemale',
        name: 'Male or Female',
        type: 'STRING',
        description: 'Male or Female of the user',
        'type:createUpdatePage': 'RadioGroup',
        'ui:createUpdatePage:enum': ['male', 'female'],
      },
      {
        id: 'age',
        name: 'Age',
        type: 'NUMBER',
      },
      {
        id: 'active',
        name: 'Active',
        type: 'BOOL',
      },
      {
        id: 'tags',
        name: 'Tags',
        type: 'STRING_ARRAY',
      },
      {
        id: 'photos',
        name: 'Photos',
        type: 'STRING_ARRAY',
        description: 'The photos of the user',
        'type:createUpdatePage': 'MultiLineInputBox',
      },
      {
        id: 'notes',
        name: 'Notes',
        type: 'STRING',
        'type:createUpdatePage': 'TextArea',
      },
      {
        id: 'this_field_will_be_hidden',
        name: 'This field will be hidden in Create/Update page',
        type: 'STRING',
        'type:createUpdatePage': 'HIDE',
      },
    ],
  },
];

const FormDemo = () => {
  return (
    <div className="dbm-form-demo">
      <Provider
        value={{
          appModes: ['split-table'],
          dbName: 'iam',
          tableName: 'users',
          action: 'create',
          columns: tables[0].columns,
          primaryKey: 'userId',
          tables,
          githubDb: null,
        }}
      >
        <Form
          defaultValues={{}}
          loading={false}
          rows={[]}
          onSubmit={() => {}}
        />
      </Provider>
    </div>
  );
};

export default FormDemo;
