/* eslint-disable max-len */

import React from 'react';
/**
 * When importing like this `import Handlebars from 'handlebars'`, will see below error when running npm run dev
 *
 * ```
 * Failed to compile.
 *
 * Module not found: Error: Can't resolve 'fs' in '/Users/devin.chenyang/source/github.com/db-man/components/node_modules/handlebars/lib'
 * WARNING in ./node_modules/handlebars/lib/index.js 20:38-56
 * require.extensions is not supported by webpack. Use a loader instead.
 *
 * WARNING in ./node_modules/handlebars/lib/index.js 21:2-20
 * require.extensions is not supported by webpack. Use a loader instead.
 *
 * WARNING in ./node_modules/handlebars/lib/index.js 22:2-20
 * require.extensions is not supported by webpack. Use a loader instead.
 * ```
 *
 * The current tmp solution is to use `import Handlebars from 'handlebars/dist/handlebars'` instead.
 *
 * See more: https://github.com/handlebars-lang/handlebars.js/issues/1174
 */
// import Handlebars from 'handlebars';
// @ts-ignore Ignore handlebars type error
import Handlebars from 'handlebars/dist/handlebars';

import {
  ImageLink,
  ImageLinks,
  Link,
  Links,
  Fragment,
} from '../components/Links';
import PhotoList from '../components/PhotoList';
import ErrorAlert from '../components/ErrorAlert';
import TextAreaFormFieldValue from '../components/TextAreaFormFieldValue';
import { getTablePrimaryKey } from '../utils';
import { RowType } from '../types/Data';
import DbTable from '../types/DbTable';
import { RenderArgs } from '../types/UiType';

interface Options {
  fn: (this: any) => string;
  hash: {
    rows?: RowType[];
    tables: DbTable[];
    tableName: string;
    primaryKeyVal: any;
  };
}

/**
 * tpl: {{#replace "foo" "bar"}}{{title}}{{/replace}}
 * input: {title:"foo"}
 * output: bar
 */
Handlebars.registerHelper(
  'replace',
  function replaceHelper(find: string, replace: string, options: Options) {
    // @ts-ignore
    const string = options.fn(this);
    return string.replace(find, replace);
  }
);

/**
 * tpl: {{join record.tags ", "}}
 * input: {"tags": ["foo", "bar"]}
 * output: "foo, bar"
 */
Handlebars.registerHelper('join', (arr: string[], sep: string) => {
  if (!arr) return '';
  return arr.join(sep);
});

Handlebars.registerHelper('getTableRecordByKey', (options: Options) => {
  if (!options.hash.rows) return null;
  const primaryKey = getTablePrimaryKey(
    options.hash.tables,
    options.hash.tableName
  );
  return options.hash.rows.find(
    (row: RowType) => row[primaryKey] === options.hash.primaryKeyVal
  );
});

/**
 * Generate a render function based on the passing component,
 * so we can later call this render function by passing an Handlebars template to dynamic render component based on the passing record
 * @param {*} Component
 * @returns {()=><Component/>} render function
 */
const genRenderFunc = (Component: any) =>
  function dComponent(
    val: any,
    record: RowType,
    index?: number,
    args?: RenderArgs,
    tplExtra?: any
  ) {
    if (!record || typeof record !== 'object') {
      console.error('[genRenderFunc] record should be an object!', record); // eslint-disable-line no-console
    }
    if (!args || !args[1]) {
      return <Component>{val}</Component>;
    }

    const tplStr = args[1];
    const tpl = Handlebars.compile(tplStr);
    const json = tpl({ record, extra: tplExtra });
    try {
      // {foo:'bar'} <= "{\"foo\":\"bar\"}"
      // "foo" <= "\"foo\""
      const props = JSON.parse(json);
      if (typeof props === 'string') {
        return <Component>{props}</Component>;
      }
      return <Component {...props} />; // eslint-disable-line react/jsx-props-no-spreading
    } catch (err) {
      console.error('Failed to parse JSON for tpl, err:', err, json);
      return (
        <div>
          val: {val}
          <ErrorAlert
            json={json}
            error={err as Error}
            tplStr={tplStr}
            record={record}
          />
        </div>
      );
    }
  };

type DdRenderFnMappingType = Record<
  string, // render function name, e.g. "Link"
  (
    val: any,
    record: RowType,
    index?: number,
    args?: RenderArgs,
    tplExtra?: any
  ) => JSX.Element
>;

/**
 * Data Driving Render Function Mapping
 */
const ddRenderFnMapping: DdRenderFnMappingType = {
  // renderFnName: (cellVal, rowVal, colIndex, ...renderFnStr) => null
  // renderFnName: (cellVal, rowVal, colIndex, ...renderFnProps) => null

  /**
   * @param {number|string} val e.g. "docs"
   * @param {Object} record e.g. `{"org":"github","repo":"docs"}`
   * @param {number} index e.g. 9, it's the 10th row
   * @param {Object|undefined} args e.g `["Link", "{\"href\":\"https://github.com/{{record.org}}/{{record.repo}}\",\"text\":\"{{record.repo}}\"}"]`
   *                                args could be undefined when column is {"type:listPage": "Link"}
   *  Usage:
   * 1. "type:getPage": ["Link", "{\"href\":\"https://github.com/{{record.org}}/{{record.repo}}\",\"text\":\"{{record.repo}}\"}"],
   * 2. "type:listPage": ["Link", "{\"href\":\"https://github.com/{{record.org}}/{{record.repo}}\",\"text\":\"{{record.repo}}\"}"]
   * 3. "type:listPage": "Link"
   */
  Link: genRenderFunc(Link),
  /**
   * Usage:
   * ```json
   * {"type:listPage": ["ImageLink",
   *   "{\"url\":\"{{record.url}}\",\"imgSrc\":\"{{record.url}}_th.jpg\",
   *     \"tags\":\"{{record.tags}}\"}"
   * ]}
   * ```
   * Issues:
   *   When record.url="https://foo.com/get?foo=bar".
   *   By using `{{record.url}}` will generate "https://foo.com/get?foo&#x3D;bar".
   *   To prevent this issue, `{{{record.url}}}` could be used. (https://handlebarsjs.com/guide/expressions.html#html-escaping)
   */
  ImageLink: genRenderFunc(ImageLink),
  ImageLinks: genRenderFunc(ImageLinks),
  /**
   * Usage:
   * ```json
   * {"type:listPage": ["Fragment", "{{join record.tags \", \"}}"]}
   * ```
   */
  Fragment: genRenderFunc(Fragment),
  Links: genRenderFunc(Links),
  /**
   * Usage:
   * ```json
   * {
   *   "type:getPage": [
   *     "PhotoList",
   *     "[{{#each record.photoUrls}}{{#if @index}},{{/if}}{\"url\":\"{{this}}\",\"imgSrc\":\"{{this}}_th.jpg\",\"description\":\"{{#with (getTableRecordByKey tables=../extra.tables tableName=\"imgs\" primaryKeyVal=this rows=../extra.rows)}}{{join tags \", \"}}{{/with}}\"}{{/each}}]"
   *   ]
   * }
   * ```
   */
  PhotoList: genRenderFunc(PhotoList),
  TextAreaFormFieldValue: genRenderFunc(TextAreaFormFieldValue),
};

export default ddRenderFnMapping;
