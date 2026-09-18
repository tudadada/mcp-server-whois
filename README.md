# mcp-server-whois

[![npm version](https://img.shields.io/npm/v/mcp-server-whois.svg)](https://www.npmjs.com/package/mcp-server-whois)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-Protocol-blue)](https://modelcontextprotocol.io)

Model Context Protocol (MCP) server for authoritative raw WHOIS lookups, domain age calculation, and registrar detection.

---

## ⚡ Features & Tools

- **`raw_whois_lookup`**: Queries authoritative registries directly via socket port 43 to obtain live WHOIS records without API limits.
- **`analyze_registration_lifecycle`**: Parses domain creation date and expiry date to evaluate domain maturity and renewal status.

---

## 🚀 Quick Start (Running with AI Clients)

### Claude Desktop Integration

Add this snippet to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "whois": {
      "command": "npx",
      "args": ["-y", "mcp-server-whois"]
    }
  }
}
```

### Cursor IDE / Windsurf Integration

Under MCP Settings, add a new stdio transport:
- **Command:** `npx -y mcp-server-whois`

---

## 📦 Local Installation & Development

```bash
npm install -g mcp-server-whois
```

Or run directly via stdio:
```bash
npx mcp-server-whois
```

---

## 📄 License

MIT License. Developed for the global AI agent and domain ecosystem.
