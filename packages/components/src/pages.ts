import CreatePage from './components/CreatePage';
import UpdatePage from './components/UpdatePage';
import ListPage from './components/ListPage';
import GetPage from './components/GetPage';
import TableConfigPage from './components/TableConfigPage';
import QueryPage from './components/QueryPage';

type PageComponentType = React.ComponentType<{
  dbName: string;
  tableName: string;
}>;

// map action to component
export const actionToComponentMapping: {
  [key: string]: PageComponentType;
} = {
  list: ListPage,
  create: CreatePage,
  update: UpdatePage,
  get: GetPage,
  schema: TableConfigPage,
  query: QueryPage,
};
