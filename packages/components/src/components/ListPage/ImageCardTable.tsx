import React, { useContext } from 'react';

import { Alert, Card, Empty, Pagination } from 'antd';
import { Link } from 'react-router-dom';
import { ImageLink } from '../Links';
import PageContext from '../../contexts/page';

const gridStyle: React.CSSProperties = {
  width: '25%',
  textAlign: 'center',
};

export type CardTablePagination = {
  pageSize: number;
  current: number;
};

const ImageCardTable = ({
  imgKey,
  dataSource,
  pagination,
  onChange,
}: {
  imgKey?: string;
  dataSource: any[];
  pagination: CardTablePagination;
  onChange: (pagination: CardTablePagination) => void;
}) => {
  const { dbName, tableName, primaryKey } = useContext(PageContext);

  if (!imgKey) {
    return (
      <Alert
        message='Error'
        description={
          <div>
            Which column data to render the image list? Please define only one
            column with <code>isListPageImageViewKey: true</code>
          </div>
        }
        type='error'
        showIcon
      />
    );
  }

  return (
    <div className='dm-card-table'>
      <Card>
        {dataSource
          .slice(
            (pagination.current - 1) * pagination.pageSize,
            pagination.current * pagination.pageSize
          )
          .map((item, index) => {
            let el = null;
            switch (typeof item[imgKey]) {
              case 'undefined':
                el = <Empty />;
                break;
              case 'string':
                el = <ImageLink imgSrc={item[imgKey]} url={item[imgKey]} />;
                break;
              case 'object':
                if (item[imgKey]?.length === 0)
                  return (
                    <Alert
                      message='Error'
                      description='Empty image list'
                      type='error'
                      showIcon
                    />
                  );
                el = (
                  <>
                    {item[imgKey].map((url: string) => (
                      <ImageLink key={url} imgSrc={url} url={url} />
                    ))}
                  </>
                );
                break;
              default:
                return (
                  <Alert
                    message='Error'
                    description={`The value of ${imgKey} is not a string or an array, but a ${typeof item[
                      imgKey
                    ]} type, cannot render image list!`}
                    type='error'
                    showIcon
                  />
                );
            }

            return (
              <Card.Grid key={index} style={gridStyle}>
                {el}
                <Link
                  to={{
                    pathname: `/${dbName}/${tableName}/update`,
                    search: `?${primaryKey}=${item[primaryKey]}`,
                  }}
                >
                  Update
                </Link>
              </Card.Grid>
            );
          })}
      </Card>
      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={dataSource.length}
        pageSizeOptions={[4 * 3, 4 * 6, 4 * 10, 4 * 20]}
        onChange={(current, pageSize) => {
          onChange({ current, pageSize });
        }}
      />
    </div>
  );
};

export default ImageCardTable;
