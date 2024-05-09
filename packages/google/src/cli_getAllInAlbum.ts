/**
 * This script fetches all the media items in a specific album and writes the
 * filenames to a JSON file.
 *
 * Usage:
 *  npx ts-node src/cli_getAllInAlbum.ts
 *
 * The output file content:
 * ```json
 * [
 *   "IMG_20191001_123456.jpg",
 *   "IMG_20191001_123457.jpg",
 *   "IMG_20191001_123458.jpg",
 *   ...
 * ]
 * ```
 */

import * as fs from 'fs';
import getAllInAlbum from './getAllInAlbum';

const main = async (albumTitle) => {
  console.time('getAllInAlbum.ts');

  const { API_KEY, ACCESS_TOKEN } = process.env;

  const [album, allMediaItems] = await getAllInAlbum(
    { API_KEY, ACCESS_TOKEN },
    albumTitle, // eslint-disable-line @typescript-eslint/comma-dangle
  );
  // eslint-disable-next-line arrow-body-style
  const allPhotosInAlbum = allMediaItems.map((mediaItem) => {
    return process.env.WITH_FILE_TYPES === 'true'
      ? mediaItem
      : mediaItem.filename;
  });

  console.log(allPhotosInAlbum);

  fs.writeFileSync(
    `${album.title}.json`,
    JSON.stringify(allPhotosInAlbum, null, 2), // eslint-disable-line @typescript-eslint/comma-dangle
  );

  console.timeEnd('getAllInAlbum.ts');
};

main(process.env.ALBUM_TITLE);
