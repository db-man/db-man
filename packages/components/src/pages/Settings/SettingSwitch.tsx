import React from 'react';
import { Switch, Typography } from 'antd';

const { Text } = Typography;

interface SettingSwitchProps {
  label: string;
  storageKey: string;
}

const SettingSwitch: React.FC<SettingSwitchProps> = ({ label, storageKey }) => {
  const [checked, setChecked] = React.useState<boolean>(
    localStorage.getItem(storageKey) === 'true'
  );

  const handleChange = (checked: boolean) => {
    setChecked(checked);
    localStorage.setItem(storageKey, checked ? 'true' : 'false');
    window.location.reload();
  };

  return (
    <div>
      <Text>{label}: </Text>
      <Switch checked={checked} onChange={handleChange} /> (key: {storageKey},
      default: false)
    </div>
  );
};

export default SettingSwitch;
