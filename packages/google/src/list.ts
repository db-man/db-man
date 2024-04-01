import axios from 'axios';
import 'dotenv/config';

const list = async () => {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://content-photoslibrary.googleapis.com/v1/albums?key=${process.env.API_KEY}`,
    headers: {
      authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      'x-referer': 'https://explorer.apis.google.com',
    },
  };

  return axios
    .request(config)
    .then((response) => response.data)
    .catch((error) => {
      console.error(`Failed to list albums: ${error.message}:`, error);
      throw new Error(`Failed to list albums: ${error.message}`);
    });
};

// (async () => {
//   console.log(await list());
// })();

export default list;
