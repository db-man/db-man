import { List, Button, message } from 'antd';

import { ImageLink } from './Links';
import { downloadImage } from '../utils';
import { LS_SHOW_DOWNLOAD_BUTTON } from '../constants';

const listGrid = {
  gutter: 16,
  xs: 1,
  sm: 2,
  md: 4,
  lg: 4,
  xl: 4,
  xxl: 3,
};

export type PhotoType = {
  url: string;
  imgSrc: string;
  description?: string;
};

const isShow = () =>
  localStorage.getItem(LS_SHOW_DOWNLOAD_BUTTON) === 'true'
    ? {}
    : { display: 'none' };

const renderItem = (item: PhotoType) => (
  <List.Item>
    <ImageLink
      url={item.url}
      imgSrc={item.imgSrc}
      description={item.description}
    />
  </List.Item>
);

const PhotoList = ({ photos }: { photos: PhotoType[] }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const renderDup = () => {
    const photoMap: {
      [key: string]: number;
    } = {};
    photos.forEach((photo) => {
      if (photoMap[photo.url] === undefined) {
        photoMap[photo.url] = 0;
      } else {
        photoMap[photo.url] += 1;
      }
    });
    return Object.keys(photoMap)
      .filter((key) => photoMap[key] > 1)
      .map((key) => photoMap[key])
      .join(',');
  };

  // Download photos every 1s
  const downloadAll = (photoUrls: string[]) => {
    let index: number = 0;

    function download(): void {
      if (index < photoUrls.length) {
        downloadImage(photoUrls[index]);
        messageApi.info('Download ' + photoUrls[index]);
        index++;
      } else {
        clearInterval(intervalId);
      }
    }

    // Run download every 1s
    const intervalId: number = window.setInterval(download, 1000);
  };

  return (
    <div>
      {contextHolder}
      {renderDup()}
      <div style={isShow()}>
        <Button
          onClick={() => {
            downloadAll(photos.map((p) => p.url));
          }}
        >
          Download All
        </Button>
      </div>
      <List grid={listGrid} dataSource={photos} renderItem={renderItem} />
    </div>
  );
};

export default PhotoList;
