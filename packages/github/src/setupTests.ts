// const localStorageMock = {
//   getItem: (key) => {
//     switch (key) {
//       case 'dbm_dbs_schema': return '{"pet":[{"name":"dogs","columns":[{"id":"name","name":"Name","type":"STRING","primary":true,"ui:createUpdatePage:placeholder":"Please fill name"},{"id":"age","name":"Age","type":"NUMBER"},{"id":"color","name":"Color","ui:createUpdatePage:enum":["white","black"],"type:createUpdatePage":"RadioGroup"}]}],"iam":[{"name":"users","columns":[{"id":"userId","name":"User ID","primary":true},{"id":"name","name":"Name"}]}]}';
//       case 'dbm_github_owner': return 'db-man';
//       case 'dbm_github_personal_access_token': return '';
//       case 'dbm_github_repo_name': return 'db';
//       case 'dbm_github_repo_path': return 'dbs';
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
