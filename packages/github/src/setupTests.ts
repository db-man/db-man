// const localStorageMock = {
//   getItem: (key) => {
//     switch (key) {
//       case 'dm_dbs_schema': return '{"pet":[{"name":"dogs","columns":[{"id":"name","name":"Name","type":"STRING","primary":true,"placeholder":"Please fill name"},{"id":"age","name":"Age","type":"NUMBER"},{"id":"color","name":"Color","enum":["white","black"],"type:createUpdatePage":"RadioGroup"}]}],"iam":[{"name":"users","columns":[{"id":"userId","name":"User ID","primary":true},{"id":"name","name":"Name"}]}]}';
//       case 'dm_github_owner': return 'db-man';
//       case 'dm_github_personal_access_token': return '';
//       case 'dm_github_repo_name': return 'db';
//       case 'dm_github_repo_path': return 'dbs';
//       default: return '';
//     }
//   },
//   setItem: jest.fn(),
//   removeItem: jest.fn(),
//   clear: jest.fn(),
//   length: 5,
//   key: jest.fn(),
// };

// global.localStorage = localStorageMock;