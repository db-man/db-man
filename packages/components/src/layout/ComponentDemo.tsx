import { types } from '@db-man/github';
import { useParams } from 'react-router';
import { Typography } from 'antd';

import MultiLineInputBox from '../components/MultiLineInputBox';
import RadioGroupFormField from '../components/RadioGroupFormField';
import TextAreaFormField from '../components/TextAreaFormField';
import PhotoList from '../components/PhotoList';
import { ImageLinks } from '../components/Links';
import { mockPhotos } from '../pages/demos/PhotoListExample';

// Use `Typography` so can apply dark theme to text
const { Text } = Typography;

export const RadioGroupFormFieldDemo = () => {
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
      value='male'
      onChange={() => {}}
    />
  );
};

export const TextAreaFormFieldDemo = () => {
  const column = {
    id: 'notes',
    name: 'Notes',
    type: 'STRING',
    'type:createUpdatePage': 'TextArea',
  };

  return (
    <TextAreaFormField
      key={column.id}
      label={column.name}
      rows={2}
      disabled={false}
      value='Take a note'
      onChange={() => {}}
    />
  );
};

export const MultiLineInputBoxDemo = () => {
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

export const PhotoListDemo = () => {
  return <PhotoList photos={mockPhotos} />;
};

export const ImageLinksDemo = () => {
  return (
    <ImageLinks
      imgs={[
        {
          url: 'https://img.alicdn.com/imgextra/i1/2653100434/O1CN01DnSgMw1F4oi1b7cnk_!!2653100434.png',
          imgSrc:
            'https://img.alicdn.com/imgextra/i1/2653100434/O1CN01DnSgMw1F4oi1b7cnk_!!2653100434.png',
        },
        {
          url: 'https://gw.alicdn.com/imgextra/i1/1049653664/O1CN01JOh4B71cw9zq0WiK9_!!0-item_pic.jpg',
          imgSrc:
            'https://gw.alicdn.com/imgextra/i1/1049653664/O1CN01JOh4B71cw9zq0WiK9_!!0-item_pic.jpg',
        },
      ]}
    />
  );
};

export const ComponentDemoRouter = ({
  componentName,
}: {
  componentName: string;
}) => {
  // render different component based on the component name
  const demoMap = {
    RadioGroup: <RadioGroupFormFieldDemo />,
    TextArea: <TextAreaFormFieldDemo />,
    MultiLineInputBox: <MultiLineInputBoxDemo />,
    PhotoList: <PhotoListDemo />,
    ImageLinks: <ImageLinksDemo />,
  };

  if (!Object.keys(demoMap).includes(componentName)) {
    return <Text>Component not found</Text>;
  }

  return (
    <div className='dbm-component-demo-router'>
      {demoMap[componentName as keyof typeof demoMap]}
    </div>
  );
};

const ComponentDemo = () => {
  const params = useParams();

  if (params.component === undefined) {
    return <Text>Component is required</Text>;
  }

  if (!['RadioGroup'].includes(params.component)) {
    return <Text>Component not found</Text>;
  }

  return (
    <div className='dbm-component-demo'>
      <ComponentDemoRouter componentName={params.component} />
    </div>
  );
};

export default ComponentDemo;
