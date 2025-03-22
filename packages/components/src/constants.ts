import { types } from '@db-man/github';

// types
export const STRING_ARRAY: types.DbColumnType = 'STRING_ARRAY';
export const STRING: types.DbColumnType = 'STRING';
export const NUMBER = 'NUMBER';
export const BOOL = 'BOOL';

// Localstorage keys
// DB info
export const LS_KEY_DB_CONNECTIONS = 'dbm_db_connections';
export const LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN =
  'dbm_github_personal_access_token';
export const LS_KEY_GITHUB_OWNER = 'dbm_github_owner'; // owner: db-man
export const LS_KEY_GITHUB_REPO_NAME = 'dbm_github_repo_name'; // repo: split-table-db
export const LS_KEY_GITHUB_REPO_PATH = 'dbm_github_repo_path'; // repoPath: db_files_dir
export const LS_KEY_GITHUB_REPO_MODES = 'dbm_github_repo_modes'; // dbModes: split-table
export const LS_KEY_DBS_SCHEMA = 'dbm_dbs_schema';
// other switches
export const LS_IS_DARK_THEME = 'dbm_is_dark_theme';
export const LS_SHOW_DOWNLOAD_BUTTON = 'dbm_show_download_button';
// UI state
export const LS_QUERY_PAGE_SELECTED_TABLE_NAMES =
  'dbm_query_page_selected_table_names';

// Table column definitions
export const COL_UI_PRESETS = 'ui:createUpdatePage:presets';
export const COL_UI_LISTPAGE_RANDOMVIEW = 'ui:listPage:randomView';

// UI type
export const TYPE_CREATE_UPDATE_PAGE = 'type:createUpdatePage';
export const TYPE_GET_PAGE = 'type:getPage';
export const TYPE_LIST_PAGE = 'type:listPage';

export const DBS_CFG_FILENAME = 'dbs.json';
export const DB_CFG_FILENAME = 'dbcfg.json';
