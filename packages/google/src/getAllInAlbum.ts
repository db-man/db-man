import list from './list';
import search from './search';

interface GooglePhotoAlbum {
  id: string;
  title: string;
}

const getAllInAlbum = async ({ API_KEY, ACCESS_TOKEN }, albumTitle: string) => {
  const albumsResponse = await list({ API_KEY, ACCESS_TOKEN });
  const album = albumsResponse.albums.find(
    (ab: GooglePhotoAlbum) => ab.title === albumTitle, // eslint-disable-line @typescript-eslint/comma-dangle
  );

  if (!album) {
    console.error('Album not found');
    return [null, null];
  }

  console.log('Album:', album.title, album.id);

  // TODO this type from google photo API
  let allMediaItems: { filename: string }[] = [];
  let pageToken: string | null = null;
  do {
    console.log('Fetching page:', allMediaItems.length, pageToken);
    // eslint-disable-next-line no-await-in-loop
    const searchResponse = await search(
      { API_KEY, ACCESS_TOKEN },
      album.id,
      pageToken,
    );
    allMediaItems = [...allMediaItems, ...searchResponse.mediaItems];
    pageToken = searchResponse.nextPageToken;
  } while (pageToken);

  return [album, allMediaItems];
};

export default getAllInAlbum;
