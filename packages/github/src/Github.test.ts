import Github from './Github';

describe('Github', () => {
  const g = new Github({
    personalAccessToken: process.env.GH_TOKEN ?? '',
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

  describe('getContentByPath', () => {
    it('should return an array with the expected length when calling getContentByPath with a directory path', async () => {
      const data = await g.getContentByPath('dbs/iam');
      // console.log('Github.getContentByPath data:', data);
      // @ts-expect-error why no length?
      expect(data.length).toBe(2);
    });

    it('should return the correct file object when calling getContentByPath with a file path', async () => {
      const data = await g.getContentByPath('dbs/iam/dbcfg.json');
      // console.log('Github.getContentByPath data:', data);
      if ('content' in data) {
        expect(data.name).toBe('dbcfg.json');
        return;
      }
      // should not be here
      expect(1).toBe(2);
    });

    it('should throw an error when calling getContentByPath with a non-existent path', async () => {
      await expect(g.getContentByPath('non-existent-path')).rejects.toThrow();
    });
  });

  describe('getContentByPathV2', () => {
    it('should return an array with a non-zero length when calling getContentByPathV2 with a directory path', async () => {
      const data = await g.getContentByPathV2('dbs/iam');
      // console.log('Github.getContentByPathV2 data:', data);
      expect(data.length).not.toBe(0);
    });

    it('should return an error object when calling getContentByPathV2 with a non-existent path', async () => {
      const [error, data] = await g.getContentByPathV2('non-existent-path');
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
