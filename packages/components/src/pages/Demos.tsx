import React from 'react';
import { Outlet } from 'react-router';
import { Link, useSearchParams } from 'react-router-dom';
import { Collapse, CollapseProps, Typography } from 'antd';

import FormDemo from '../components/Form/FormDemo';
import ImageLinkDemo from '../components/ImageLinkDemo';
import ImageLinksDemo from 'components/ImageLinksDemo';
import MultiLineInputBoxDemo from 'components/MultiLineInputBoxDemo';
import PhotoListExample from '../components/PhotoListDemo';
import RadioGroupFormFieldDemo from 'components/RadioGroupFormFieldDemo';
import TextAreaFormFieldDemo from 'components/TextAreaFormFieldDemo';

// Use `Typography` so can apply dark theme to text
const { Text } = Typography;

const demoMap = {
  Form: <FormDemo />,
  ImageLink: <ImageLinkDemo />,
  ImageLinks: <ImageLinksDemo />,
  MultiLineInputBox: <MultiLineInputBoxDemo />,
  PhotoList: <PhotoListExample />,
  // PhotoList: <PhotoListExample />,
  RadioGroup: <RadioGroupFormFieldDemo />,
  TextArea: <TextAreaFormFieldDemo />,
};

const items: CollapseProps['items'] = Object.keys(demoMap).map((key) => ({
  key,
  label: key,
  children: demoMap[key as keyof typeof demoMap],
  extra: (
    <>
      <Link to={`/demos?component=${key}`}>Demo Link</Link>
    </>
  ),
}));

export const ComponentDemoRouter = ({
  compName,
  renderBackBtn,
}: {
  compName: string;
  renderBackBtn?: boolean;
}) => {
  if (!Object.keys(demoMap).includes(compName)) {
    return <Text>Component not found</Text>;
  }

  return (
    <div className="dbm-render-single-demo">
      {renderBackBtn && <Link to="/demos">Back to demos list</Link>}
      {demoMap[compName as keyof typeof demoMap]}
    </div>
  );
};

const Demos = () => {
  const [searchParams] = useSearchParams();
  const compName = searchParams.get('component');

  return (
    <>
      {compName ? (
        <ComponentDemoRouter compName={compName} renderBackBtn />
      ) : (
        <Collapse items={items} defaultActiveKey={['Form']} />
      )}
      <Outlet />
    </>
  );
};

export default Demos;
