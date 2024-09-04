import { Alert } from 'antd';
import { RadioGroupUiTypeEnum } from '../types/UiType';

/**
 * To valid the type of form field value, then show warning message if the type is not expected.
 * Here is an example of table schema:
 * ```json
 * {
 *   "id": "userName",
 *   "name": "User Name",
 *   "type": "STRING"
 * }
 * ```
 * And here is an example of invalid field value:
 * ```json
 * {
 *   "userName": 123
 * }
 * ```
 * The type of `userName` should be `string`, but the current type is `number`, will show warning.
 */
export const FieldValueWarning = ({
  expectedTypes,
  value,
}: {
  expectedTypes: string[];
  value?: string;
}) => {
  if (expectedTypes.includes(typeof value)) return null;
  return (
    <Alert
      message={`(The type of this form field value is ${typeof value}, but it should be one of ${expectedTypes.join(
        ', '
      )})`}
      type='warning'
    />
  );
};

/**
 * To valid the type of field schema, then show warning message if the type is not expected.
 * Here is an example of invalid field schema:
 * ```json
 * {
 *   "type:createUpdatePage": "RadioGroup",
 *   "ui:createUpdatePage:enum": undefined
 * }
 * ```
 * The type of `ui:createUpdatePage:enum` should be `Array<string>`, but the current type is `undefined`.
 */
export const FieldSchemaWarning = ({
  expectedType,
  fieldSchema,
}: {
  expectedType: string;
  fieldSchema?: string | RadioGroupUiTypeEnum;
}) => {
  if (typeof fieldSchema === expectedType) return null;
  return (
    <Alert
      message={`(The type of this form field schema should be ${expectedType}, but current type is ${typeof fieldSchema})`}
      type='warning'
    />
  );
};
