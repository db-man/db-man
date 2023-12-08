// @ts-nocheck

import PropTypes from 'prop-types';
import { TYPE_GET_PAGE, TYPE_LIST_PAGE } from '../constants';

// Data driven type
// e.g. "Link"
// e.g. ["Link", "https://github.com/{{record.user}}/{{record.repo}}"]
//
// You can also supply a custom validator to `arrayOf` and `objectOf`.
// It should return an Error object if the validation fails. The validator
// will be called for each key in the array or object. The first two
// arguments of the validator are the array or object itself, and the
// current item's key.
const ddType = PropTypes.arrayOf(
  (
    propValue: any[], // the whole array, e.g. ["Link", "{\"href\":\"https://github.com/{{record.user}}/{{record.repo}}\",\"text\":\"{{record.user}}/{{record.repo}}\"}"}]
    key: number, // index of the element needed to check in this array, e.g. 0
    componentName: string, // e.g. "ListPage"
    location: string, // e.g. "prop"
    propFullName: string // e.g. "columns[0].type:listPage[0]"
  ) => {
    // eslint-disable-line consistent-return
    switch (key) {
      // Check component name which used to render this value
      case 0: {
        if (typeof propValue[0] !== 'string') {
          return new Error(
            `Invalid prop \`${propFullName}\` supplied to` +
              ` \`${componentName}\`. Validation failed. First element should be a string.`
          );
        }
        break;
      }
      // Second element in array should be
      case 1: {
        if (
          typeof propValue[1] !== 'string' &&
          typeof propValue[1] !== 'object'
        ) {
          return new Error(
            `Invalid prop \`${propFullName}\` supplied to` +
              ` \`${componentName}\`. Validation failed. Second element should be a string or object.`
          );
        }
        break;
      }
      default:
    }
  }
);

// See also: UiType in src/types/Column.ts
const uiType = PropTypes.oneOfType([
  PropTypes.string, // e.g. "Link"
  ddType, // e.g. ["Link", "https://github.com/{{record.user}}/{{record.repo}}"]
]);

const column = PropTypes.shape({
  name: PropTypes.string,
  type: PropTypes.string,
  'type:createUpdatePage': uiType,
  [TYPE_GET_PAGE]: uiType,
  [TYPE_LIST_PAGE]: uiType,
});

const columns = PropTypes.arrayOf(column);

const DvPropTypes = {
  column,
  columns,
};

export default DvPropTypes;
