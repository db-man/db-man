import TextAreaFormField from '../components/TextAreaFormField';

const TextAreaFormFieldDemo = () => {
  const column = {
    id: 'notes',
    name: 'Notes',
    type: 'STRING',
    'type:createUpdatePage': 'TextArea',
  };

  return (
    <TextAreaFormField
      key={column.id}
      rows={2}
      disabled={false}
      value="Take a note"
      onChange={() => {}}
    />
  );
};

export default TextAreaFormFieldDemo;
