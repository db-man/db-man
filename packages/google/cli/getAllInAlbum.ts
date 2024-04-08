/**
 * This script fetches all the media items in a specific album and writes the
 * filenames to a JSON file.
 *
 * Usage:
 *  npx ts-node src/getAllInAlbum.ts
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
import list from '../src/list';
import search from '../src/search';

interface GooglePhotoAlbum {
  id: string;
  title: string;
}

const main = async (albumTitle) => {
  console.time('getAllInAlbum.ts');

  const { API_KEY, ACCESS_TOKEN } = process.env;

  const albumsResponse = await list({ API_KEY, ACCESS_TOKEN });
  const album = albumsResponse.albums.find(
    (ab: GooglePhotoAlbum) => ab.title === albumTitle // eslint-disable-line @typescript-eslint/comma-dangle
  );

  if (!album) {
    console.error('Album not found');
    return;
  }

  console.log('Album:', album.title, album.id);

  let photoFilenames: string[] = [];
  let pageToken = null;
  do {
    console.log('Fetching page:', pageToken);
    // eslint-disable-next-line no-await-in-loop
    const searchResponse = await search(
      { API_KEY, ACCESS_TOKEN },
      album.id,
      pageToken // eslint-disable-line @typescript-eslint/comma-dangle
    );
    photoFilenames = [
      ...photoFilenames,
      ...searchResponse.mediaItems.map((photo) => photo.filename),
    ];
    pageToken = searchResponse.nextPageToken;
  } while (pageToken);

  console.log(photoFilenames);

  fs.writeFileSync(
    `${album.title}.json`,
    JSON.stringify(photoFilenames, null, 2) // eslint-disable-line @typescript-eslint/comma-dangle
  );

  console.timeEnd('getAllInAlbum.ts');
};

main(process.env.ALBUM_TITLE);
