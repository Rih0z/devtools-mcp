import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';

// ── JSON Tools ──

export function jsonFormat(input: string, indent: number = 2): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed, null, indent);
}

export function jsonMinify(input: string): string {
  return JSON.stringify(JSON.parse(input));
}

export function jsonValidate(input: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

export function jsonToYaml(input: string): string {
  const obj = JSON.parse(input);
  return toYaml(obj, 0);
}

function toYaml(value: unknown, indent: number): string {
  const pad = '  '.repeat(indent);
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    // Quote strings that could be misinterpreted as YAML types
    const needsQuoting = value.includes('\n') || value.includes(':') || value.includes('#')
      || value.includes('"') || value.includes("'")
      || /^(true|false|null|yes|no|on|off)$/i.test(value)
      || /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(value)
      || value === '' || value.startsWith(' ') || value.endsWith(' ');
    if (needsQuoting) {
      return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
    }
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value.map(v => `\n${pad}- ${toYaml(v, indent + 1).trimStart()}`).join('');
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return entries
      .map(([k, v]) => {
        const val = toYaml(v, indent + 1);
        const safeKey = /[:{}\[\],&*?|>!%@`#]/.test(k) || /^(true|false|null|yes|no)$/i.test(k) ? `"${k}"` : k;
        if (typeof v === 'object' && v !== null) {
          return `\n${pad}${safeKey}:${val}`;
        }
        return `\n${pad}${safeKey}: ${val}`;
      })
      .join('');
  }
  return String(value);
}

export function jsonToTypescript(input: string, rootName: string = 'Root'): string {
  const obj = JSON.parse(input);
  const interfaces: string[] = [];
  generateInterface(obj, rootName, interfaces);
  return interfaces.join('\n\n');
}

function generateInterface(obj: unknown, name: string, interfaces: string[]): void {
  if (Array.isArray(obj)) {
    if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
      generateInterface(obj[0], name + 'Item', interfaces);
      return;
    }
    return;
  }
  if (typeof obj !== 'object' || obj === null) return;
  const lines: string[] = [`export interface ${name} {`];
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const type = inferType(value, key, name, interfaces);
    lines.push(`  ${key}: ${type};`);
  }
  lines.push('}');
  interfaces.push(lines.join('\n'));
}

function inferType(value: unknown, key: string, parentName: string, interfaces: string[]): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    const itemType = inferType(value[0], key, parentName, interfaces);
    return `${itemType}[]`;
  }
  if (typeof value === 'object') {
    const childName = parentName + capitalize(key);
    generateInterface(value, childName, interfaces);
    return childName;
  }
  return typeof value;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Encoding Tools ──

export function base64Encode(input: string): string {
  return Buffer.from(input, 'utf-8').toString('base64');
}

export function base64Decode(input: string): string {
  return Buffer.from(input, 'base64').toString('utf-8');
}

export function urlEncode(input: string): string {
  return encodeURIComponent(input);
}

export function urlDecode(input: string): string {
  return decodeURIComponent(input);
}

export function htmlEncode(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function htmlDecode(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function numberBaseConvert(value: string, fromBase: number, toBase: number): string {
  const decimal = parseInt(value, fromBase);
  if (isNaN(decimal)) throw new Error(`Invalid number "${value}" for base ${fromBase}`);
  return decimal.toString(toBase);
}

// ── Security Tools ──

export function hashGenerate(input: string, algorithm: string = 'sha256'): string {
  return createHash(algorithm).update(input, 'utf-8').digest('hex');
}

export function uuidGenerate(): string {
  return randomUUID();
}

export function passwordGenerate(length: number = 16, options?: { uppercase?: boolean; lowercase?: boolean; numbers?: boolean; symbols?: boolean }): string {
  const opts = { uppercase: true, lowercase: true, numbers: true, symbols: true, ...options };
  let chars = '';
  if (opts.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (opts.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (opts.numbers) chars += '0123456789';
  if (opts.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = randomBytes(length);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

export function jwtDecode(token: string): { header: unknown; payload: unknown; signature: string } {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format: expected 3 parts separated by dots');
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf-8'));
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
  return { header, payload, signature: parts[2] };
}

export function chmodCalculate(input: string): { numeric: string; symbolic: string; breakdown: string } {
  if (/^\d{3,4}$/.test(input)) {
    const digits = input.padStart(3, '0').slice(-3);
    const symbolic = digits.split('').map((d, i) => {
      const n = parseInt(d);
      const who = ['u', 'g', 'o'][i];
      const r = n & 4 ? 'r' : '-';
      const w = n & 2 ? 'w' : '-';
      const x = n & 1 ? 'x' : '-';
      return `${who}=${r}${w}${x}`;
    }).join(',');
    return { numeric: digits, symbolic, breakdown: `owner=${digits[0]}, group=${digits[1]}, others=${digits[2]}` };
  }
  throw new Error('Input must be a 3 or 4 digit octal number (e.g., 755)');
}

// ── Data Tools ──

export function timestampConvert(input: string): { unix: number; iso: string; utc: string; local: string } {
  let date: Date;
  if (/^\d{10,13}$/.test(input)) {
    const ms = input.length === 10 ? parseInt(input) * 1000 : parseInt(input);
    date = new Date(ms);
  } else {
    date = new Date(input);
  }
  if (isNaN(date.getTime())) throw new Error(`Invalid timestamp or date: "${input}"`);
  return {
    unix: Math.floor(date.getTime() / 1000),
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toString(),
  };
}

export function csvToJson(csv: string, delimiter: string = ','): object[] {
  const lines = parseCsvLines(csv.trim(), delimiter);
  if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row');
  const headers = lines[0];
  return lines.slice(1).map(values => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });
    return obj;
  });
}

function parseCsvLines(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        row.push(field);
        field = '';
      } else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
        if (ch === '\r') i++;
      } else {
        field += ch;
      }
    }
  }
  row.push(field);
  if (row.some(f => f !== '')) rows.push(row);
  return rows;
}

export function jsonToCsv(input: string, delimiter: string = ','): string {
  const arr = JSON.parse(input);
  if (!Array.isArray(arr) || arr.length === 0) throw new Error('Input must be a non-empty JSON array');
  const headers = Object.keys(arr[0]);
  const rows = arr.map((obj: Record<string, unknown>) =>
    headers.map(h => {
      const val = String(obj[h] ?? '');
      return val.includes(delimiter) || val.includes('"') || val.includes('\n')
        ? `"${val.replace(/"/g, '""')}"`
        : val;
    }).join(delimiter)
  );
  return [headers.join(delimiter), ...rows].join('\n');
}

export function cronExplain(expression: string): string {
  const parts = expression.trim().split(/\s+/);
  if (parts.length < 5 || parts.length > 6) throw new Error('CRON expression must have 5 or 6 fields');
  const names = ['minute', 'hour', 'day of month', 'month', 'day of week'];
  if (parts.length === 6) names.unshift('second');
  return parts.map((p, i) => {
    if (p === '*') return `${names[i]}: every`;
    if (p.includes('/')) return `${names[i]}: every ${p.split('/')[1]}`;
    if (p.includes('-')) return `${names[i]}: ${p} (range)`;
    if (p.includes(',')) return `${names[i]}: ${p} (list)`;
    return `${names[i]}: ${p}`;
  }).join('\n');
}

// ── Text Tools ──

export function stringCaseConvert(input: string, targetCase: string): string {
  const words = input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_\-./]+/g, ' ')
    .trim()
    .split(/\s+/);

  switch (targetCase) {
    case 'camel': return words.map((w, i) => i === 0 ? w.toLowerCase() : capitalize(w.toLowerCase())).join('');
    case 'pascal': return words.map(w => capitalize(w.toLowerCase())).join('');
    case 'snake': return words.map(w => w.toLowerCase()).join('_');
    case 'kebab': return words.map(w => w.toLowerCase()).join('-');
    case 'upper': return words.map(w => w.toUpperCase()).join('_');
    case 'title': return words.map(w => capitalize(w.toLowerCase())).join(' ');
    default: throw new Error(`Unknown case: ${targetCase}. Use: camel, pascal, snake, kebab, upper, title`);
  }
}

export function regexTest(pattern: string, flags: string, testString: string): { matches: { match: string; index: number; groups?: string[] }[]; count: number } {
  // Safety: limit input size to prevent excessive processing
  if (testString.length > 100_000) throw new Error('Test string exceeds 100,000 character limit');
  if (pattern.length > 500) throw new Error('Pattern exceeds 500 character limit');

  const re = new RegExp(pattern, flags);
  const matches: { match: string; index: number; groups?: string[] }[] = [];

  if (flags.includes('g')) {
    let m;
    const maxMatches = 1000;
    while ((m = re.exec(testString)) !== null && matches.length < maxMatches) {
      matches.push({ match: m[0], index: m.index, groups: m.slice(1).length > 0 ? m.slice(1) : undefined });
      if (m[0].length === 0) re.lastIndex++; // prevent infinite loop on zero-length match
    }
  } else {
    const m = testString.match(re);
    if (m) matches.push({ match: m[0], index: m.index ?? 0, groups: m.slice(1).length > 0 ? m.slice(1) : undefined });
  }
  return { matches, count: matches.length };
}

export function textDiff(text1: string, text2: string): string {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  const result: string[] = [];
  const maxLen = Math.max(lines1.length, lines2.length);
  for (let i = 0; i < maxLen; i++) {
    const l1 = lines1[i];
    const l2 = lines2[i];
    if (l1 === undefined) {
      result.push(`+ ${l2}`);
    } else if (l2 === undefined) {
      result.push(`- ${l1}`);
    } else if (l1 !== l2) {
      result.push(`- ${l1}`);
      result.push(`+ ${l2}`);
    } else {
      result.push(`  ${l1}`);
    }
  }
  return result.join('\n');
}

export function slugGenerate(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
