import MultiLineInputBox from '../components/MultiLineInputBox';

const MultiLineInputBoxDemo = () => {
  // const column = {
  //   id: 'photoUrls',
  //   name: 'Photo URLs',
  //   type: 'STRING_ARRAY',
  //   'type:createUpdatePage': 'MultiLineInputBox'
  // };

  return (
    <MultiLineInputBox
      rows={2}
      disabled={false}
      value={[
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg',
      ]}
      onChange={() => {}}
    />
  );
};

export default MultiLineInputBoxDemo;
