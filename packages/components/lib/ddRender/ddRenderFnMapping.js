/* eslint-disable max-len */
import React from 'react';
/**
 * https://github.com/handlebars-lang/handlebars.js/issues/1174
 * ```
 * Compiled with problems:
 * ERROR in ./node_modules/handlebars/lib/index.js 15:11-24
 * Module not found: Error: Can't resolve 'fs' in '/.../node_modules/handlebars/lib'
 * ```
 */
// import Handlebars from "handlebars";

import Handlebars from 'handlebars/dist/handlebars';
import { utils } from 'db-man';
import { ImageLink, ImageLinks, Link, Links, Fragment } from '../components/Links';
import PhotoList from '../components/PhotoList';
import ErrorAlert from '../components/ErrorAlert';
import TextAreaFormFieldValue from '../components/TextAreaFormFieldValue';
/**
 * tpl: {{#replace "foo" "bar"}}{{title}}{{/replace}}
 * input: {title:"foo"}
 * output: bar
 */

Handlebars.registerHelper('replace', function replaceHelper(find, replace, options) {
  const string = options.fn(this);
  return string.replace(find, replace);
});
/**
 * tpl: {{join record.tags ", "}}
 * input: {"tags": ["foo", "bar"]}
 * output: "foo, bar"
 */

Handlebars.registerHelper('join', (arr, sep) => {
  if (!arr) return '';
  return arr.join(sep);
});
Handlebars.registerHelper('getTableRecordByKey', options => {
  if (!options.hash.rows) return null;
  const primaryKey = utils.getTablePrimaryKey(options.hash.tables, options.hash.tableName);
  return options.hash.rows.find(row => row[primaryKey] === options.hash.primaryKeyVal);
});

const ddComponent = Component => function dComponent(val, record, index, args, tplExtra) {
  if (!record || typeof record !== 'object') {
    console.error('[ddComponent] record should be an object!', record); // eslint-disable-line no-console
  }

  if (!args || !args[1]) {
    return /*#__PURE__*/React.createElement(Component, null, val);
  }

  const tplStr = args[1];
  const tpl = Handlebars.compile(tplStr);
  const json = tpl({
    record,
    extra: tplExtra
  });

  try {
    // {foo:'bar'} <= "{\"foo\":\"bar\"}"
    // "foo" <= "\"foo\""
    const props = JSON.parse(json);

    if (typeof props === 'string') {
      return /*#__PURE__*/React.createElement(Component, null, props);
    }

    return /*#__PURE__*/React.createElement(Component, props); // eslint-disable-line react/jsx-props-no-spreading
  } catch (err) {
    console.error('Failed to parse JSON for tpl, err:', err, json); // eslint-disable-line no-console

    return /*#__PURE__*/React.createElement("div", null, "val:", ' ', val, /*#__PURE__*/React.createElement(ErrorAlert, {
      json: json,
      error: err,
      tplStr: tplStr,
      record: record
    }));
  }
};
/**
 * Data Driving Render Function Mapping
 */


const ddRenderFnMapping = {
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
  Link: ddComponent(Link),

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
  ImageLink: ddComponent(ImageLink),
  ImageLinks: ddComponent(ImageLinks),

  /**
   * Usage:
   * ```json
   * {"type:listPage": ["Fragment", "{{join record.tags \", \"}}"]}
   * ```
   */
  Fragment: ddComponent(Fragment),
  Links: ddComponent(Links),

  /**
   * Usage:
   * ```json
   * {
   *   "type:getPage": [
   *     "PhotoList",
   *     "[{{#each record.photoUrls}}{{#if @index}},{{/if}}{\"url\":\"{{this}}\",\"imgSrc\":\"{{this}}_th.jpg\",\"description\":\"{{#with (getTableRecordByKey tables=../extra.tables tableName=\"rates\" primaryKeyVal=this rows=../extra.rows)}}{{join tags \", \"}}{{/with}}\"}{{/each}}]"
   *   ]
   * }
   * ```
   */
  PhotoList: ddComponent(PhotoList),
  TextAreaFormFieldValue: ddComponent(TextAreaFormFieldValue)
};
export default ddRenderFnMapping;