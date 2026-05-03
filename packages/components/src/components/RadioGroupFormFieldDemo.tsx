import { types } from '@db-man/github';
import RadioGroupFormField from './RadioGroupFormField';

const RadioGroupFormFieldDemo = () => {
  const column = {
    id: 'maleOrFemale',
    name: 'Male or Female',
    type: 'STRING' as types.DbColumnType,
    'type:createUpdatePage': 'RadioGroup',
    'ui:createUpdatePage:enum': ['male', 'female'],
  };

  return (
    <RadioGroupFormField
      disabled={false}
      column={column}
      value="male"
      onChange={() => {}}
    />
  );
};

export default RadioGroupFormFieldDemo;
