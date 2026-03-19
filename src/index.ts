#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import * as tools from './tools/index.js';

const server = new McpServer({
  name: 'devtools-mcp',
  version: '1.0.0',
});

/** Wrap tool handler with MCP-compliant error handling (isError: true) */
function safeTool<T>(fn: (args: T) => string | object): (args: T) => Promise<{ content: { type: 'text'; text: string }[]; isError?: boolean }> {
  return async (args: T) => {
    try {
      const result = fn(args);
      const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      return { content: [{ type: 'text' as const, text }] };
    } catch (e) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${(e as Error).message}` }],
        isError: true,
      };
    }
  };
}

// ── JSON Tools ──

server.tool('json_format', 'Format and beautify JSON with configurable indentation. Use for pretty-printing minified JSON.', {
  json: z.string().describe('JSON string to format'),
  indent: z.number().optional().default(2).describe('Indentation spaces (default: 2)'),
}, safeTool(({ json, indent }) => tools.jsonFormat(json, indent)));

server.tool('json_minify', 'Minify JSON by removing all whitespace. Reduces JSON size for storage or transmission.', {
  json: z.string().describe('JSON string to minify'),
}, safeTool(({ json }) => tools.jsonMinify(json)));

server.tool('json_validate', 'Validate JSON syntax and report parsing errors with location.', {
  json: z.string().describe('JSON string to validate'),
}, safeTool(({ json }) => tools.jsonValidate(json)));

server.tool('json_to_yaml', 'Convert JSON to YAML format. Handles nested objects, arrays, and all JSON types.', {
  json: z.string().describe('JSON string to convert'),
}, safeTool(({ json }) => tools.jsonToYaml(json)));

server.tool('json_to_typescript', 'Generate TypeScript interfaces from JSON data. Creates nested interfaces for complex objects.', {
  json: z.string().describe('JSON string to generate interfaces from'),
  rootName: z.string().optional().default('Root').describe('Name for root interface'),
}, safeTool(({ json, rootName }) => tools.jsonToTypescript(json, rootName)));

// ── Encoding Tools ──

server.tool('base64_encode', 'Encode text to Base64 (UTF-8).', {
  text: z.string().describe('Text to encode'),
}, safeTool(({ text }) => tools.base64Encode(text)));

server.tool('base64_decode', 'Decode Base64 string to UTF-8 text.', {
  encoded: z.string().describe('Base64 string to decode'),
}, safeTool(({ encoded }) => tools.base64Decode(encoded)));

server.tool('url_encode', 'URL-encode a string using encodeURIComponent.', {
  text: z.string().describe('Text to URL-encode'),
}, safeTool(({ text }) => tools.urlEncode(text)));

server.tool('url_decode', 'URL-decode a percent-encoded string.', {
  encoded: z.string().describe('URL-encoded string to decode'),
}, safeTool(({ encoded }) => tools.urlDecode(encoded)));

server.tool('html_encode', 'Encode HTML special characters (&, <, >, ", \') to entities.', {
  text: z.string().describe('Text to encode'),
}, safeTool(({ text }) => tools.htmlEncode(text)));

server.tool('html_decode', 'Decode HTML entities (&amp; &lt; &gt; &quot; &#39;) to characters.', {
  encoded: z.string().describe('HTML-encoded string to decode'),
}, safeTool(({ encoded }) => tools.htmlDecode(encoded)));

server.tool('number_base_convert', 'Convert numbers between bases: binary(2), octal(8), decimal(10), hexadecimal(16).', {
  value: z.string().describe('Number to convert (e.g., "ff", "255", "11111111")'),
  fromBase: z.number().min(2).max(36).describe('Source base (2-36)'),
  toBase: z.number().min(2).max(36).describe('Target base (2-36)'),
}, safeTool(({ value, fromBase, toBase }) => tools.numberBaseConvert(value, fromBase, toBase)));

// ── Security Tools ──

server.tool('hash_generate', 'Generate cryptographic hash of text. Supports MD5, SHA-1, SHA-256, SHA-512.', {
  text: z.string().describe('Text to hash'),
  algorithm: z.enum(['md5', 'sha1', 'sha256', 'sha512']).optional().default('sha256').describe('Hash algorithm (default: sha256)'),
}, safeTool(({ text, algorithm }) => tools.hashGenerate(text, algorithm)));

server.tool('uuid_generate', 'Generate a cryptographically random UUID v4.', {}, safeTool(() => tools.uuidGenerate()));

server.tool('password_generate', 'Generate a cryptographically secure random password with configurable character sets.', {
  length: z.number().min(4).max(256).optional().default(16).describe('Password length (4-256, default: 16)'),
  uppercase: z.boolean().optional().default(true).describe('Include uppercase letters'),
  lowercase: z.boolean().optional().default(true).describe('Include lowercase letters'),
  numbers: z.boolean().optional().default(true).describe('Include digits'),
  symbols: z.boolean().optional().default(true).describe('Include special characters'),
}, safeTool(({ length, uppercase, lowercase, numbers, symbols }) =>
  tools.passwordGenerate(length, { uppercase, lowercase, numbers, symbols })));

server.tool('jwt_decode', 'Decode a JWT token without verification. Returns header, payload, and signature.', {
  token: z.string().describe('JWT token string (header.payload.signature)'),
}, safeTool(({ token }) => tools.jwtDecode(token)));

server.tool('chmod_calculate', 'Calculate Unix file permissions. Converts octal notation to symbolic (e.g., 755 → rwxr-xr-x).', {
  mode: z.string().regex(/^\d{3,4}$/).describe('Octal permission string (e.g., "755", "644")'),
}, safeTool(({ mode }) => tools.chmodCalculate(mode)));

// ── Data Tools ──

server.tool('timestamp_convert', 'Convert between Unix timestamps and ISO 8601 dates. Accepts seconds, milliseconds, or date strings.', {
  input: z.string().describe('Unix timestamp (seconds/ms) or date string (ISO 8601, RFC 2822, etc.)'),
}, safeTool(({ input }) => tools.timestampConvert(input)));

server.tool('csv_to_json', 'Parse CSV text into a JSON array of objects. First row is used as headers.', {
  csv: z.string().describe('CSV text with header row'),
  delimiter: z.string().min(1).max(1).optional().default(',').describe('Column delimiter (default: comma)'),
}, safeTool(({ csv, delimiter }) => tools.csvToJson(csv, delimiter)));

server.tool('json_to_csv', 'Convert a JSON array of objects to CSV text with headers.', {
  json: z.string().describe('JSON array of objects'),
  delimiter: z.string().min(1).max(1).optional().default(',').describe('Column delimiter (default: comma)'),
}, safeTool(({ json, delimiter }) => tools.jsonToCsv(json, delimiter)));

server.tool('cron_explain', 'Parse and explain a CRON expression in human-readable form.', {
  expression: z.string().describe('CRON expression (5 or 6 space-separated fields)'),
}, safeTool(({ expression }) => tools.cronExplain(expression)));

// ── Text Tools ──

server.tool('string_case_convert', 'Convert string between naming conventions: camelCase, PascalCase, snake_case, kebab-case, UPPER_CASE, Title Case.', {
  text: z.string().describe('Text to convert'),
  targetCase: z.enum(['camel', 'pascal', 'snake', 'kebab', 'upper', 'title']).describe('Target naming convention'),
}, safeTool(({ text, targetCase }) => tools.stringCaseConvert(text, targetCase)));

server.tool('regex_test', 'Test a regular expression pattern against a string. Returns all matches with groups.', {
  pattern: z.string().describe('Regex pattern without delimiters (e.g., "\\d+" not "/\\d+/")'),
  flags: z.string().optional().default('g').describe('Regex flags (g=global, i=case-insensitive, m=multiline)'),
  testString: z.string().describe('String to test the pattern against'),
}, safeTool(({ pattern, flags, testString }) => tools.regexTest(pattern, flags, testString)));

server.tool('text_diff', 'Compare two texts line by line. Shows additions (+), deletions (-), and unchanged lines.', {
  text1: z.string().describe('Original text'),
  text2: z.string().describe('Modified text'),
}, safeTool(({ text1, text2 }) => tools.textDiff(text1, text2)));

server.tool('slug_generate', 'Generate a URL-friendly slug from any text. Handles Unicode, strips accents, normalizes separators.', {
  text: z.string().describe('Text to convert to a URL slug'),
}, safeTool(({ text }) => tools.slugGenerate(text)));

// ── Start Server ──

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
