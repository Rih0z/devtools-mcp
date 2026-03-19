# DevToolBox MCP Plugin

This plugin adds 25 developer tools to Claude Code via MCP.

## Setup

```bash
claude mcp add devtools-mcp -- npx @ezark/devtools-mcp
```

Or as a plugin:

```bash
claude plugin add /path/to/devtools-mcp
```

## Tools

JSON (format, minify, validate, to-yaml, to-typescript), Base64, URL encode, HTML entities, number base convert, hash generate, UUID, password generate, JWT decode, chmod calculate, timestamp convert, CSV↔JSON, CRON explain, string case convert, regex test, text diff, slug generate.

All processing is local. No data sent to any server.
