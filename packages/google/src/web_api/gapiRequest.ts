declare global {
  interface Window {
    gapi: any;
  }
}

export interface File {
  id: string;
  name: string;
  imageMediaMetadata: {
    location: {
      altitude: number;
      latitude: number;
      longitude: number;
    };
  };
  thumbnailLink: string;
  webContentLink: string;
  webViewLink: string;
}

export interface FilesListResponse {
  files: File[];
}

/**
 * Send Google API request
 * Used to get files from Google Drive
 * @export
 * @param {*} requestOpts
 * @returns
 */
export default function gapiRequest(
  requestOpts: any,
): Promise<FilesListResponse> {
  return new Promise((resolve) => {
    // https://github.com/google/google-api-javascript-client/blob/master/docs/reference.md#----gapiclientrequestargs--
    const restRequest = window.gapi.client.request(requestOpts);
    restRequest.execute((resp: FilesListResponse) => {
      resolve(resp);
    });
  });
}
