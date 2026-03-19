#!/bin/bash
# Install devtools-mcp for Claude Code
set -e

INSTALL_DIR="${HOME}/.local/share/devtools-mcp"

echo "Installing devtools-mcp to ${INSTALL_DIR}..."

if [ -d "$INSTALL_DIR" ]; then
  echo "Updating existing installation..."
  cd "$INSTALL_DIR" && git pull
else
  git clone https://github.com/Rih0z/devtools-mcp.git "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

npm install --production 2>/dev/null
npm run build 2>/dev/null

echo ""
echo "✅ devtools-mcp installed successfully!"
echo ""
echo "Add to Claude Code:"
echo "  claude mcp add devtools-mcp -- node ${INSTALL_DIR}/dist/index.js"
echo ""
echo "Or add to Claude Desktop (claude_desktop_config.json):"
echo '  {"mcpServers":{"devtools-mcp":{"command":"node","args":["'${INSTALL_DIR}'/dist/index.js"]}}}'
