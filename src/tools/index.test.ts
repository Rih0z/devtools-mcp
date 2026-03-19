import { describe, it, expect } from 'vitest';
import * as tools from './index.js';

describe('JSON Tools', () => {
  it('formats JSON', () => {
    expect(tools.jsonFormat('{"a":1,"b":2}')).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });
  it('minifies JSON', () => {
    expect(tools.jsonMinify('{\n  "a": 1\n}')).toBe('{"a":1}');
  });
  it('validates valid JSON', () => {
    expect(tools.jsonValidate('{"a":1}').valid).toBe(true);
  });
  it('validates invalid JSON', () => {
    const r = tools.jsonValidate('{bad}');
    expect(r.valid).toBe(false);
    expect(r.error).toBeDefined();
  });
  it('converts JSON to YAML', () => {
    const yaml = tools.jsonToYaml('{"name":"test","count":42}');
    expect(yaml).toContain('name: test');
    expect(yaml).toContain('count: 42');
  });
  it('generates TypeScript interfaces', () => {
    const ts = tools.jsonToTypescript('{"id":1,"name":"test"}', 'User');
    expect(ts).toContain('export interface User');
    expect(ts).toContain('id: number');
    expect(ts).toContain('name: string');
  });
});

describe('Encoding Tools', () => {
  it('base64 round-trip', () => {
    expect(tools.base64Decode(tools.base64Encode('hello world'))).toBe('hello world');
  });
  it('url encode/decode', () => {
    expect(tools.urlEncode('hello world')).toBe('hello%20world');
    expect(tools.urlDecode('hello%20world')).toBe('hello world');
  });
  it('html encode/decode', () => {
    expect(tools.htmlEncode('<div>"test"</div>')).toBe('&lt;div&gt;&quot;test&quot;&lt;/div&gt;');
    expect(tools.htmlDecode('&lt;div&gt;')).toBe('<div>');
  });
  it('number base convert', () => {
    expect(tools.numberBaseConvert('255', 10, 16)).toBe('ff');
    expect(tools.numberBaseConvert('ff', 16, 2)).toBe('11111111');
  });
});

describe('Security Tools', () => {
  it('generates SHA-256 hash', () => {
    const hash = tools.hashGenerate('test', 'sha256');
    expect(hash).toBe('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
  });
  it('generates UUID v4', () => {
    const uuid = tools.uuidGenerate();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
  it('generates password with correct length', () => {
    expect(tools.passwordGenerate(32).length).toBe(32);
  });
  it('decodes JWT', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const decoded = tools.jwtDecode(token);
    expect(decoded.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect((decoded.payload as { name: string }).name).toBe('John Doe');
  });
  it('calculates chmod', () => {
    const result = tools.chmodCalculate('755');
    expect(result.numeric).toBe('755');
    expect(result.symbolic).toContain('u=rwx');
  });
});

describe('Data Tools', () => {
  it('converts timestamp', () => {
    const result = tools.timestampConvert('1700000000');
    expect(result.iso).toBe('2023-11-14T22:13:20.000Z');
    expect(result.unix).toBe(1700000000);
  });
  it('converts CSV to JSON', () => {
    const result = tools.csvToJson('name,age\nAlice,30\nBob,25');
    expect(result).toEqual([{ name: 'Alice', age: '30' }, { name: 'Bob', age: '25' }]);
  });
  it('converts JSON to CSV', () => {
    const csv = tools.jsonToCsv('[{"name":"Alice","age":30}]');
    expect(csv).toContain('name,age');
    expect(csv).toContain('Alice,30');
  });
  it('explains CRON', () => {
    const result = tools.cronExplain('*/5 * * * *');
    expect(result).toContain('every 5');
  });
});

describe('Text Tools', () => {
  it('converts string case', () => {
    expect(tools.stringCaseConvert('hello world', 'camel')).toBe('helloWorld');
    expect(tools.stringCaseConvert('hello world', 'snake')).toBe('hello_world');
    expect(tools.stringCaseConvert('helloWorld', 'kebab')).toBe('hello-world');
  });
  it('tests regex', () => {
    const result = tools.regexTest('\\d+', 'g', 'abc 123 def 456');
    expect(result.count).toBe(2);
  });
  it('diffs text', () => {
    const diff = tools.textDiff('line1\nline2', 'line1\nline3');
    expect(diff).toContain('- line2');
    expect(diff).toContain('+ line3');
  });
  it('generates slug', () => {
    expect(tools.slugGenerate('Hello World! 2024')).toBe('hello-world-2024');
  });
});

describe('Error Handling (MCP isError compliance)', () => {
  it('jsonFormat throws on invalid JSON', () => {
    expect(() => tools.jsonFormat('{bad}')).toThrow();
  });
  it('jsonMinify throws on invalid JSON', () => {
    expect(() => tools.jsonMinify('not json')).toThrow();
  });
  it('jwtDecode throws on invalid token', () => {
    expect(() => tools.jwtDecode('not.a.jwt')).toThrow();
  });
  it('timestampConvert throws on invalid input', () => {
    expect(() => tools.timestampConvert('not-a-date')).toThrow();
  });
  it('csvToJson throws on header-only CSV', () => {
    expect(() => tools.csvToJson('header_only')).toThrow();
  });
  it('chmodCalculate throws on invalid mode', () => {
    expect(() => tools.chmodCalculate('abc')).toThrow();
  });
  it('numberBaseConvert throws on invalid number', () => {
    expect(() => tools.numberBaseConvert('xyz', 10, 16)).toThrow();
  });
  it('stringCaseConvert throws on unknown case', () => {
    expect(() => tools.stringCaseConvert('test', 'unknown')).toThrow();
  });
});

describe('CSV RFC 4180 compliance', () => {
  it('handles quoted fields with embedded delimiter', () => {
    const result = tools.csvToJson('name,age\n"Smith, John",30');
    expect(result).toEqual([{ name: 'Smith, John', age: '30' }]);
  });
  it('handles escaped quotes inside quoted fields', () => {
    const result = tools.csvToJson('msg\n"He said ""hello"""');
    expect(result).toEqual([{ msg: 'He said "hello"' }]);
  });
  it('handles CRLF line endings', () => {
    const result = tools.csvToJson('a,b\r\n1,2\r\n3,4');
    expect(result).toEqual([{ a: '1', b: '2' }, { a: '3', b: '4' }]);
  });
});

describe('YAML type safety', () => {
  it('quotes string "true" to avoid YAML boolean', () => {
    const yaml = tools.jsonToYaml('{"active":"true"}');
    expect(yaml).toContain('"true"');
  });
  it('quotes string "null" to avoid YAML null', () => {
    const yaml = tools.jsonToYaml('{"val":"null"}');
    expect(yaml).toContain('"null"');
  });
  it('quotes numeric string to avoid YAML number', () => {
    const yaml = tools.jsonToYaml('{"port":"8080"}');
    expect(yaml).toContain('"8080"');
  });
  it('quotes key with colon', () => {
    const yaml = tools.jsonToYaml('{"a:b":1}');
    expect(yaml).toContain('"a:b"');
  });
  it('handles nested objects', () => {
    const yaml = tools.jsonToYaml('{"a":{"b":{"c":1}}}');
    expect(yaml).toContain('c: 1');
  });
  it('handles empty string', () => {
    const yaml = tools.jsonToYaml('{"x":""}');
    expect(yaml).toContain('""');
  });
});

describe('Regex safety', () => {
  it('limits pattern length', () => {
    const longPattern = 'a'.repeat(501);
    expect(() => tools.regexTest(longPattern, 'g', 'test')).toThrow('500 character limit');
  });
  it('limits test string length', () => {
    const longString = 'a'.repeat(100_001);
    expect(() => tools.regexTest('a', 'g', longString)).toThrow('100,000 character limit');
  });
  it('handles zero-length match without infinite loop', () => {
    const result = tools.regexTest('', 'g', 'abc');
    expect(result.count).toBeGreaterThan(0);
    expect(result.count).toBeLessThanOrEqual(4); // '', '', '', '' between/around chars
  });
});

describe('Edge cases', () => {
  it('slugGenerate handles empty string', () => {
    expect(tools.slugGenerate('')).toBe('');
  });
  it('password excludes numbers when disabled', () => {
    const pw = tools.passwordGenerate(100, { uppercase: false, lowercase: true, numbers: false, symbols: false });
    expect(pw).toMatch(/^[a-z]+$/);
  });
  it('base64 handles unicode', () => {
    expect(tools.base64Decode(tools.base64Encode('日本語テスト'))).toBe('日本語テスト');
  });
});
