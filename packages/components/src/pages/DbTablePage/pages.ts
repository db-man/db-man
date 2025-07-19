import CreatePage from './CreatePage';
import UpdatePage from './UpdatePage';
import ListPage from './ListPage';
import GetPage from './GetPage';
import SchemaPage from './SchemaPage';
import QueryPage from './QueryPage';
import InsightsPage from './InsightsPage';

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
  schema: SchemaPage,
  query: QueryPage,
  insights: InsightsPage,
};
