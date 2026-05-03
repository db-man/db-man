import PhotoList from '../components/PhotoList';
import { mockPhotos } from '../pages/demos/PhotoListExample';

const PhotoListDemo = () => {
  return <PhotoList photos={mockPhotos} />;
};

export default PhotoListDemo;
