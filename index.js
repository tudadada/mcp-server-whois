#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";



import net from 'node:net';

function queryWhoisServer(domain) {
  return new Promise((resolve) => {
    const clean = domain.trim().toLowerCase();
    const socket = new net.Socket();
    socket.setTimeout(6000);
    let buffer = '';
    socket.connect(43, 'whois.verisign-grs.com', () => {
      socket.write(`=${clean}\r\n`);
    });
    socket.on('data', chunk => buffer += chunk.toString());
    socket.on('close', () => resolve(buffer || 'No WHOIS record returned.'));
    socket.on('timeout', () => { socket.destroy(); resolve('WHOIS query timed out.'); });
    socket.on('error', err => resolve(`WHOIS query error: ${err.message}`));
  });
}

function analyzeLifecycle(createYear, expireYear) {
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - createYear);
  const remainingYears = Math.max(0, expireYear - currentYear);
  return {
    age_in_years: age,
    remaining_years_registered: remainingYears,
    seo_authority_bonus: age > 10 ? 'High Vintage Trust (10+ years old)' : age > 3 ? 'Mature' : 'Newly Registered (<3 years)',
    drop_risk: remainingYears <= 0 ? 'Expiring soon or in redemption grace period' : 'Safely registered'
  };
}


const server = new Server(
  {
    name: "mcp-server-whois",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const TOOLS = [
      {
            "name": "raw_whois_lookup",
            "description": "Queries authoritative registries directly via socket port 43 to obtain live WHOIS records without API limits.",
            "inputSchema": {
                  "type": "object",
                  "properties": {
                        "domain": {
                              "type": "string",
                              "description": "The domain name to lookup (e.g. google.com)"
                        }
                  },
                  "required": [
                        "domain"
                  ]
            }
      },
      {
            "name": "analyze_registration_lifecycle",
            "description": "Parses domain creation date and expiry date to evaluate domain maturity and renewal status.",
            "inputSchema": {
                  "type": "object",
                  "properties": {
                        "creation_year": {
                              "type": "number",
                              "description": "Domain initial creation year"
                        },
                        "expiry_year": {
                              "type": "number",
                              "description": "Domain expiry year"
                        }
                  },
                  "required": [
                        "creation_year",
                        "expiry_year"
                  ]
            }
      }
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {

    if (name === 'raw_whois_lookup') {
      const res = await queryWhoisServer(args.domain);
      return { content: [{ type: 'text', text: res }] };
    }

    if (name === 'analyze_registration_lifecycle') {
      const res = analyzeLifecycle(args.creation_year, args.expiry_year);
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }
    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error: ${error.message}` }],
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

run().catch((err) => {
  process.exit(1);
});
