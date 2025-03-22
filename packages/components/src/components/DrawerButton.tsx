import React, { useState } from 'react';

import { Button, Drawer, ButtonProps } from 'antd';

const DrawerButton: React.FC<{
  title: string;
  buttonText: string;
  content: React.ReactNode;
  buttonProps?: ButtonProps;
}> = ({ title, buttonText, content, buttonProps }) => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button {...buttonProps} onClick={showDrawer}>
        {buttonText}
      </Button>
      <Drawer title={title} onClose={onClose} open={open}>
        {content}
      </Drawer>
    </>
  );
};

export default DrawerButton;
