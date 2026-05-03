import { useParams } from 'react-router';
import { Typography } from 'antd';

import ImageLinksDemo from 'components/ImageLinksDemo';
import MultiLineInputBoxDemo from 'components/MultiLineInputBoxDemo';
import PhotoListDemo from 'components/PhotoListDemo';
import RadioGroupFormFieldDemo from 'components/RadioGroupFormFieldDemo';
import TextAreaFormFieldDemo from 'components/TextAreaFormFieldDemo';

// Use `Typography` so can apply dark theme to text
const { Text } = Typography;

export const ComponentDemoRouter = ({
  componentName,
}: {
  componentName: string;
}) => {
  // render different component based on the component name
  const demoMap = {
    ImageLinks: <ImageLinksDemo />,
    MultiLineInputBox: <MultiLineInputBoxDemo />,
    PhotoList: <PhotoListDemo />,
    RadioGroup: <RadioGroupFormFieldDemo />,
    TextArea: <TextAreaFormFieldDemo />,
  };

  if (!Object.keys(demoMap).includes(componentName)) {
    return <Text>Component not found</Text>;
  }

  return (
    <div className="dbm-component-demo-router">
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
    <div className="dbm-component-demo">
      <ComponentDemoRouter componentName={params.component} />
    </div>
  );
};

export default ComponentDemo;
