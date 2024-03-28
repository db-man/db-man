import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { ComponentDemoRouter } from '../layout/ComponentDemo';

const ComponentDemoModal = ({ componentName }: { componentName: string }) => {
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
      {componentName}{' '}
      <Button type='primary' size='small' onClick={showModal}>
        demo
      </Button>
      <Modal
        title='Component Demo'
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <ComponentDemoRouter componentName={componentName} />
      </Modal>
    </>
  );
};

export default ComponentDemoModal;
