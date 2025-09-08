import gapiRequest, { FilesListResponse } from './gapiRequest';

// type File = {
//   id: string;
//   name: string;
//   imageMediaMetadata: {
//     location: {
//       altitude: number;
//       latitude: number;
//       longitude: number;
//     };
//   };
//   thumbnailLink: string;
//   webContentLink: string;
//   webViewLink: string;
// };
// export type FilesListResponse = {
//   files: File[];
// };

/**
 * Get one single file from Google Drive according to fileId
 * API: https://developers.google.com/drive/api/v3/reference/files/get#request
 * @param {Object} params https://developers.google.com/drive/api/v3/reference/files/get#parameters
 * @param {string} params.alt Could be "media"
 *
 * @returns {Promise<FilesGetResponse>}
 */
export const filesGet = async (params: { fileId: string; alt?: string }) => {
  if (params.alt) {
    return gapiRequest({
      path: `https://www.googleapis.com/drive/v3/files/${params.fileId}?alt=${params.alt}`,
    });
  }
  return gapiRequest({
    path: `https://www.googleapis.com/drive/v3/files/${params.fileId}`,
  });
};

/**
 * File from Google Drive
 *
 * sample of file
 *
 * ```json
 * {
 *   "imageMediaMetadata": {
 *     "location": {
 *       "altitude": 63.91292952824694,
 *       "latitude": 1.87650555555555,
 *       "longitude": 103.20539722222223
 *     }
 *   },
 *   "thumbnailLink": "https://lh3.googleusercontent.com/zugQb...tO6f0mfk7-al8xxDb4=s220",
 *   "webContentLink": "https://drive.google.com/uc?id=1f8...De&export=download",
 *   "webViewLink": "https://drive.google.com/file/d/1f8...wDe/view?usp=drivesdk"
 * }
 * ```
 * @typedef {Object} File
 * @property {Object} imageMediaMetadata
 * @property {string} thumbnailLink
 * @property {string} webContentLink
 * @property {string} webViewLink
 */

/**
 * Response of getting files from Google Drive
 *
 * Sample of response
 *
 * ```json
 * {
 *   "files": [{
 *     "thumbnailLink": "https://lh3.googleusercontent.com/rSd...220",
 *     "imageMediaMetadata": {
 *       "location": {
 *         "latitude": 1,
 *         "longitude": 103,
 *         "altitude": 456
 *       }
 *     }
 *   }]
 * }
 * ```
 *
 * @typedef {Object} FilesListResponse
 * @property {File[]} files
 */

/**
 * Lists the user's files.
 * - Get files in folder: params={q: "'folderId' in parents"}
 * API: https://developers.google.com/drive/api/v3/reference/files/list#request
 * @returns {Promise<FilesListResponse>}
 */
export const filesList = async (params: {
  q?: string;
  pageSize?: number;
  fields?: string;
  orderBy?: string;
  pageToken?: string;
  spaces?: string;
  corpora?: string;
  driveId?: string;
  includeItemsFromAllDrives?: boolean;
  supportsAllDrives?: boolean;
  includeTeamDriveItems?: boolean;
}): Promise<FilesListResponse> => {
  console.log('params', params);
  return gapiRequest({
    path: 'https://www.googleapis.com/drive/v3/files',
    params,
  });
};

// In this way, the API style is like: https://developers.google.com/drive/api/reference/rest/v3/files/get#request
export const files = {
  get: filesGet,
  list: filesList,
};
