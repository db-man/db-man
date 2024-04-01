/**
 * This script fetches all the media items in a specific album and writes the
 * filenames to a JSON file.
 *
 * Usage:
 *  node getAllInAlbum.js
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
import list from './list';
import search from './search';

console.time('getAllInAlbum.js');

interface GooglePhotoAlbum {
  id: string;
  title: string;
}

const main = async (albumTitle) => {
  const albums = await list();
  const album = albums.albums.find(
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
    const searchResponse = await search(album.id, pageToken); // eslint-disable-line no-await-in-loop
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
};

main(process.env.ALBUM_TITLE);

console.timeEnd('getAllInAlbum.js');
