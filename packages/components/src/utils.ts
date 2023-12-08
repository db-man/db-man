import { types } from '@db-man/github';
import { message } from 'antd';
import DbColumn from './types/DbColumn';

export const getUrlParams = () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  return Object.fromEntries(urlSearchParams.entries());
};

/**
 *
 * @param {*} columns
 * @returns {string}
 */
export const getPrimaryKey = (columns: DbColumn[]) => {
  const foundCol = columns.find((col) => col.primary);
  return foundCol ? foundCol.id : '';
};

export const getTablePrimaryKey = (
  tables: types.DbTable[],
  tableName: string
) => {
  const foundTable = tables.find((table) => table.name === tableName);
  if (!foundTable) {
    return '';
  }

  return getPrimaryKey(foundTable.columns);
};

export const errMsg = (msg: string, err?: Error) => {
  console.error(`[db-man] ${msg}`, err); // eslint-disable-line no-console
  message.error(msg);
};

// Copy from https://stackoverflow.com/questions/49474775/chrome-65-blocks-cross-origin-a-download-client-side-workaround-to-force-down
export const downloadImage = (imgUrl: string) => {
  function forceDownload(blob: string, filename: string) {
    var a = document.createElement('a');
    a.download = filename;
    a.href = blob;
    // For Firefox https://stackoverflow.com/a/32226068
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  // Current blob size limit is around 500MB for browsers
  function downloadResource(url: string, filename: string) {
    if (!filename) {
      // Try to get the last part of URL as the filename
      // for example `353339.jpg` from `https://img.com/a/b/c/353339.jpg`
      filename = url.split('\\').pop()?.split('/').pop() || '';
    }
    fetch(url, {
      headers: new Headers({
        Origin: window.location.origin,
      }),
      mode: 'cors',
    })
      .then((response) => response.blob())
      .then((blob) => {
        let blobUrl = window.URL.createObjectURL(blob);
        forceDownload(blobUrl, filename);
      })
      .catch((e) => console.error('downloadImage() failed to fetch', e));
  }
  downloadResource(imgUrl, '');
};
