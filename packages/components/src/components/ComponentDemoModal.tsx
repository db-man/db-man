import React, { useState } from 'react';
import { Button, Modal } from 'antd';

import { ComponentDemoRouter } from '../layout/ComponentDemo';
import { GetPageUiType, RenderArgs } from '../types/UiType';

const getComponentName = (renderArg: RenderArgs) => {
  let componentName = '';
  if (typeof renderArg === 'string') {
    componentName = renderArg;
  } else if (typeof renderArg[0] === 'string') {
    componentName = renderArg[0];
  }
  return componentName;
};

const ComponentDemoModal = ({ renderArg }: { renderArg: GetPageUiType }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {typeof renderArg === 'string' ? renderArg : JSON.stringify(renderArg)}{' '}
      <Button type='primary' size='small' onClick={showModal}>
        demo
      </Button>
      <Modal
        title='Component Demo'
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <ComponentDemoRouter componentName={getComponentName(renderArg)} />
      </Modal>
    </>
  );
};

export default ComponentDemoModal;
