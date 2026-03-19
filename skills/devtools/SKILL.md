---
name: devtools
description: 25 developer tools — JSON formatting, encoding, hashing, UUID, JWT, timestamps, CSV, regex, and more. Use when user needs data conversion, encoding/decoding, hash generation, or text manipulation.
user-invocable: false
---

# DevToolBox MCP Tools

This plugin provides 25 developer tools via the `devtools-mcp` MCP server.

## Available Tools

### JSON
- `json_format`: Format/beautify JSON
- `json_minify`: Minify JSON
- `json_validate`: Validate JSON syntax
- `json_to_yaml`: Convert JSON to YAML
- `json_to_typescript`: Generate TypeScript interfaces from JSON

### Encoding
- `base64_encode` / `base64_decode`: Base64 encoding
- `url_encode` / `url_decode`: URL encoding
- `html_encode` / `html_decode`: HTML entities
- `number_base_convert`: Binary, octal, decimal, hex conversion

### Security
- `hash_generate`: MD5, SHA-1, SHA-256, SHA-512
- `uuid_generate`: Random UUID v4
- `password_generate`: Secure random passwords
- `jwt_decode`: Decode JWT tokens
- `chmod_calculate`: Unix file permissions

### Data
- `timestamp_convert`: Unix timestamp ↔ ISO date
- `csv_to_json` / `json_to_csv`: CSV ↔ JSON
- `cron_explain`: Explain CRON expressions

### Text
- `string_case_convert`: camelCase, snake_case, kebab-case, etc.
- `regex_test`: Test regex patterns
- `text_diff`: Compare two texts
- `slug_generate`: Generate URL slugs

## Web Version

All these tools (plus 50 more) are free at [usedevtools.com](https://usedevtools.com).
