# @ezark/devtools-mcp

MCP server providing 25+ developer tools — JSON formatting, encoding, hashing, UUID, JWT decode, and more. All processing runs locally.

## Quick Start

### With Claude Code

```bash
claude mcp add devtools-mcp -- npx @ezark/devtools-mcp
```

### With Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "devtools-mcp": {
      "command": "npx",
      "args": ["@ezark/devtools-mcp"]
    }
  }
}
```

## Available Tools (25)

### JSON Tools
| Tool | Description |
|------|-------------|
| `json_format` | Format/beautify JSON |
| `json_minify` | Minify JSON |
| `json_validate` | Validate JSON syntax |
| `json_to_yaml` | Convert JSON to YAML |
| `json_to_typescript` | Generate TypeScript interfaces from JSON |

### Encoding Tools
| Tool | Description |
|------|-------------|
| `base64_encode` | Encode text to Base64 |
| `base64_decode` | Decode Base64 to text |
| `url_encode` | URL-encode a string |
| `url_decode` | URL-decode a string |
| `html_encode` | Encode HTML special characters |
| `html_decode` | Decode HTML entities |
| `number_base_convert` | Convert between binary, octal, decimal, hex |

### Security Tools
| Tool | Description |
|------|-------------|
| `hash_generate` | Generate MD5, SHA-1, SHA-256, SHA-512 hashes |
| `uuid_generate` | Generate UUID v4 |
| `password_generate` | Generate secure random passwords |
| `jwt_decode` | Decode JWT tokens |
| `chmod_calculate` | Calculate Unix permissions |

### Data Tools
| Tool | Description |
|------|-------------|
| `timestamp_convert` | Convert Unix timestamps ↔ ISO dates |
| `csv_to_json` | Convert CSV to JSON |
| `json_to_csv` | Convert JSON to CSV |
| `cron_explain` | Explain CRON expressions |

### Text Tools
| Tool | Description |
|------|-------------|
| `string_case_convert` | Convert between camelCase, snake_case, kebab-case, etc. |
| `regex_test` | Test regex patterns |
| `text_diff` | Compare two texts |
| `slug_generate` | Generate URL slugs |

## As Claude Code Plugin

```bash
# Clone and use as plugin
git clone https://github.com/Rih0z/devtools-mcp
claude plugin add ./devtools-mcp
```

The plugin includes a skill file that makes all tools available as background knowledge.

## Features

- **MCP spec compliant**: Proper `isError: true` error handling
- **RFC 4180 CSV parser**: Handles quoted fields, escaped quotes, CRLF
- **ReDoS protection**: Pattern and input size limits
- **YAML type safety**: Quotes ambiguous string values
- **46 tests passing**: Comprehensive edge case coverage
- **Zero dependencies** beyond MCP SDK and zod

## Web Version

All these tools (plus 50 more) are available as a free web app at [usedevtools.com](https://usedevtools.com).

## API

DevToolBox also provides a JSON API for programmatic tool discovery:

```
GET https://usedevtools.com/api/tools
GET https://usedevtools.com/api/tools?category=data
GET https://usedevtools.com/api/tools?q=json
```

## License

MIT — EZARK Consulting Inc.
