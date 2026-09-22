// @ts-ignore Ignore handlebars type error
import Handlebars from 'handlebars/dist/handlebars';

describe('Handlebars compilation', () => {
  it('escapes query parameters in URLs using double-curly braces', () => {
    const tpl = Handlebars.compile(
      `{"href":"{{record.url}}","text":"{{record.url}}"}`,
    );
    const json = tpl({
      record: { url: 'https://foobar.com?barfoo=123' },
      extra: undefined,
    });
    expect(json).toEqual(
      '{"href":"https://foobar.com?barfoo&#x3D;123","text":"https://foobar.com?barfoo&#x3D;123"}',
    );
  });

  it('renders raw, unescaped URLs using triple-curly braces', () => {
    // Using triple curlies {{{...}}} bypasses Handlebars' HTML escaping mechanism,
    // preserving the raw string input as-is (keeping '=' and other special characters intact).
    // Otherwise it will render into `https://foobar.com?barfoo&#x3D;123` instead of `https://foobar.com?barfoo=123`
    const tpl = Handlebars.compile(
      `{"href":"{{{record.url}}}","text":"{{{record.url}}}"}`,
    );
    const json = tpl({
      record: { url: 'https://foobar.com?barfoo=123' },
      extra: undefined,
    });
    expect(json).toEqual(
      '{"href":"https://foobar.com?barfoo=123","text":"https://foobar.com?barfoo=123"}',
    );
  });
});
