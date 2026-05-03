import { ImageLinks } from '../components/Links';

const ImageLinksDemo = () => {
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

export default ImageLinksDemo;
