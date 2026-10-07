import { message } from 'antd';

import { downloadImage, errMsg, getUrlParams } from './utils';

describe('getUrlParams', () => {
  afterEach(() => window.history.pushState({}, '', '/'));

  test('should return proper value', () => {
    expect(getUrlParams()).toEqual({});
  });

  test('should turn the query string into an object', () => {
    window.history.pushState({}, '', '/?dbName=iam&tableName=users');

    expect(getUrlParams()).toEqual({ dbName: 'iam', tableName: 'users' });
  });
});

describe('errMsg', () => {
  let consoleError;
  let messageError;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    messageError = jest.spyOn(message, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
    messageError.mockRestore();
  });

  test('should log the message and show it to the user', () => {
    errMsg('something failed');

    expect(consoleError).toHaveBeenCalledWith(
      '[db-man] something failed',
      undefined
    );
    expect(messageError).toHaveBeenCalledWith('something failed', 10);
  });

  test('should log the error along with the message', () => {
    const err = new Error('boom');

    errMsg('something failed', err);

    expect(consoleError).toHaveBeenCalledWith('[db-man] something failed', err);
    expect(messageError).toHaveBeenCalledWith('something failed', 10);
  });
});

describe('downloadImage', () => {
  const realFetch = global.fetch;
  let clickSpy;
  let clickedDownloadName;
  let fetchMock;

  beforeAll(() => {
    // jsdom implements neither fetch, Headers nor URL.createObjectURL, and
    // `downloadImage` needs all three. Plain stand-ins are enough, and they
    // must not be jest.fn(): resetMocks would empty them before every test.
    if (!global.Headers) {
      global.Headers = class Headers {};
    }
    Object.defineProperty(window.URL, 'createObjectURL', {
      writable: true,
      value: () => 'blob:db-man-test',
    });
  });

  beforeEach(() => {
    clickedDownloadName = undefined;
    clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function captureDownload() {
        clickedDownloadName = this.download;
      });
    fetchMock = jest.fn(() =>
      Promise.resolve({ blob: () => Promise.resolve({ type: 'image/jpeg' }) })
    );
    global.fetch = fetchMock;
  });

  afterEach(() => {
    clickSpy.mockRestore();
    global.fetch = realFetch;
  });

  // Let the fetch -> blob -> click promise chain settle.
  const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

  test('should fetch the image and click a link named after the file', async () => {
    downloadImage('https://img.com/a/b/c/353339.jpg');
    await settle();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://img.com/a/b/c/353339.jpg',
      expect.objectContaining({ mode: 'cors' })
    );
    expect(clickedDownloadName).toBe('353339.jpg');
  });

  test('should take the file name from a Windows style path', async () => {
    downloadImage('C:\\photos\\353339.jpg');
    await settle();

    expect(clickedDownloadName).toBe('353339.jpg');
  });

  test('should report a failed fetch instead of clicking a link', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    fetchMock.mockImplementation(() => Promise.reject(new Error('nope')));

    downloadImage('https://img.com/a/b/c/353339.jpg');
    await settle();

    expect(consoleError).toHaveBeenCalledWith(
      'downloadImage() failed to fetch',
      expect.any(Error)
    );
    expect(clickedDownloadName).toBeUndefined();

    consoleError.mockRestore();
  });
});
