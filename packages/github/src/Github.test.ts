import Github from './Github';

describe('Github', () => {
  const g = new Github({
    personalAccessToken: process.env.TOKEN ?? '',
    owner: 'db-man',
    repoName: 'db',
  });

  // Declare the consoleErrorSpy variable outside the hooks
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console.error to suppress the error output during the tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    consoleErrorSpy.mockRestore();
  });

  describe('getPath', () => {
    it('should return an array with the expected length when calling getPath with a directory path', async () => {
      const data = await g.getPath('dbs/iam');
      // console.log('Github.getPath data:', data);
      // @ts-expect-error why no length?
      expect(data.length).toBe(2);
    });

    it('should return the correct file object when calling getPath with a file path', async () => {
      const data = await g.getPath('dbs/iam/dbcfg.json');
      // console.log('Github.getPath data:', data);
      if ('content' in data) {
        expect(data.name).toBe('dbcfg.json');
        return;
      }
      // should not be here
      expect(1).toBe(2);
    });

    it('should throw an error when calling getPath with a non-existent path', async () => {
      await expect(g.getPath('non-existent-path')).rejects.toThrow();
    });
  });

  describe('getPathV2', () => {
    it('should return an array with a non-zero length when calling getPathV2 with a directory path', async () => {
      const data = await g.getPathV2('dbs/iam');
      // console.log('Github.getPathV2 data:', data);
      expect(data.length).not.toBe(0);
    });

    it('should return an error object when calling getPathV2 with a non-existent path', async () => {
      const [error, data] = await g.getPathV2('non-existent-path');
      expect(error).toBeDefined();
      // Check if the error is an object and has the 'type' property
      if (typeof error === 'object' && 'type' in error!) {
        expect(error.type).toBe('FileNotFound');
      } else {
        // If the error is not the expected object type, make the test case fail
        expect(true).toBe(false);
      }
      expect(data).toBeNull();
    });
  });
});
