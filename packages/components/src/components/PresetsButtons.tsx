import React from 'react';
import { Button } from 'antd';

import { COL_UI_PRESETS } from '../constants';
import DbColumn from '../types/DbColumn';

type OnChangeType = (
  value: string,
  event: React.MouseEvent<HTMLElement>
) => void;

const PresetsButtons = ({
  column,
  onChange,
}: {
  column: DbColumn;
  onChange: OnChangeType;
}) => (
  <>
    {(column[COL_UI_PRESETS] || []).map((opt) => (
      <span key={opt}>
        <Button
          size='small'
          onClick={(event) => {
            onChange(opt, event);
          }}
        >
          {opt}
        </Button>{' '}
      </span>
    ))}
  </>
);

export default PresetsButtons;
