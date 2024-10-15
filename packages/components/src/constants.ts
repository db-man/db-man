import { DbColumnType } from './types/DbColumn';

// types
export const STRING_ARRAY: DbColumnType = 'STRING_ARRAY';
export const STRING: DbColumnType = 'STRING';
export const NUMBER = 'NUMBER';
export const BOOL = 'BOOL';

// Localstorage keys
export const LS_KEY_DBS_SCHEMA = 'dbm_dbs_schema';
export const LS_KEY_GITHUB_OWNER = 'dbm_github_owner';
export const LS_KEY_GITHUB_PERSONAL_ACCESS_TOKEN =
  'dbm_github_personal_access_token';
export const LS_KEY_GITHUB_REPO_NAME = 'dbm_github_repo_name';
export const LS_KEY_GITHUB_REPO_PATH = 'dbm_github_repo_path';
export const LS_KEY_GITHUB_REPO_MODES = 'dbm_github_repo_modes';
export const LS_KEY_DB_CONNECTIONS = 'dbm_db_connections';
// dbm_is_dark_theme
export const LS_IS_DARK_THEME = 'dbm_is_dark_theme';
export const LS_SHOW_DOWNLOAD_BUTTON = 'dbm_show_download_button';

// Table column definitions
export const COL_UI_PRESETS = 'ui:presets';

// UI type
export const TYPE_GET_PAGE = 'type:getPage';
export const TYPE_LIST_PAGE = 'type:listPage';
export const TYPE_CREATE_UPDATE_PAGE = 'type:createUpdatePage';

export const DBS_CFG_FILENAME = 'dbs.json';
export const DB_CFG_FILENAME = 'dbcfg.json';
