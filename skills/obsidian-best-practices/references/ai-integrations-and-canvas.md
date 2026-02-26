# AI Integrations and Canvas

## Table of Contents

- [AI Plugins Inside Obsidian](#ai-plugins-inside-obsidian)
- [MCP Servers for External AI Access](#mcp-servers-for-external-ai-access)
- [Agent Skills for Obsidian](#agent-skills-for-obsidian)
- [Canvas and Visual Knowledge Mapping](#canvas-and-visual-knowledge-mapping)

---

## AI Plugins Inside Obsidian

### Smart Connections

[Smart Connections](https://github.com/brianpetro/obsidian-smart-connections) finds related notes using AI embeddings — matching on meaning, not just keywords.

- Runs a local embeddings model via `transformers.js` — no API key needed, no data leaves your machine.
- Smart Chat (conversational Q&A over your vault) is a separate plugin.
- **Best for:** Discovering hidden connections between notes.

### Copilot for Obsidian

[Copilot for Obsidian](https://github.com/logancyang/obsidian-copilot) is a chat-based AI assistant inside your vault:

- **Vault search via chat** — ask questions about your notes in natural language.
- **Project Mode** — scope AI context to specific folders/tags.
- **Agent Mode (Plus)** — autonomous tool-calling for vault and web searches.
- Supports Claude, GPT, Gemini, and local models.
- **Best for:** Drafting, Q&A over your vault, and AI-assisted writing.

### When to Use Which

| Need | Plugin |
|---|---|
| "Show me notes related to this one" | Smart Connections |
| "Summarize my notes on distributed systems" | Copilot for Obsidian |
| "Draft a design doc based on my meeting notes" | Copilot for Obsidian |
| "What are the gaps in my knowledge graph?" | Smart Connections |

---

## MCP Servers for External AI Access

[MCP (Model Context Protocol)](https://modelcontextprotocol.io) lets AI assistants like Claude Desktop, Claude Code, or VS Code Copilot read and write to your Obsidian vault through a standardized interface.

### Recommended MCP Servers

| Server | Key Feature | Link |
|---|---|---|
| **obsidian-mcp-server** (cyanheads) | Full CRUD + search + frontmatter management via Local REST API | [GitHub](https://github.com/cyanheads/obsidian-mcp-server) |
| **mcp-obsidian** (bitbonsai) | Zero-dependency, works with any vault structure, no Obsidian plugin required | [GitHub](https://github.com/bitbonsai/mcp-obsidian) |
| **obsidian-mcp-tools** (jacksteamdev) | Semantic search + Obsidian template execution from AI clients | [GitHub](https://github.com/jacksteamdev/obsidian-mcp-tools) |
| **obsidian-mcp-plugin** (aaronsb) | Graph-traversal-aware — AI navigates your vault as a knowledge graph | [GitHub](https://github.com/aaronsb/obsidian-mcp-plugin) |

### Setup Example (Claude Code)

Most MCP servers require the [Local REST API](https://github.com/coddingtonbear/obsidian-local-rest-api) Obsidian plugin. Install it, generate an API key, then configure your MCP client:

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": ["-y", "obsidian-mcp-server"],
      "env": {
        "OBSIDIAN_API_KEY": "your-api-key-here",
        "OBSIDIAN_API_URL": "https://127.0.0.1:27124"
      }
    }
  }
}
```

---

## Agent Skills for Obsidian

Agent Skills are Markdown instruction files that teach AI assistants how to work with specific tools and formats.

### Official: kepano/obsidian-skills

The [official Obsidian Skills](https://github.com/kepano/obsidian-skills) by Steph Ango (Obsidian's CEO):

| Skill | What It Teaches the Agent |
|---|---|
| **obsidian-markdown** | Create/edit `.md` files with wikilinks, embeds, callouts, properties, Obsidian-specific syntax. |
| **obsidian-bases** | Work with `.base` files — views, filters, formulas, summaries. |
| **json-canvas** | Create `.canvas` files with nodes, edges, groups, connections. |
| **obsidian-cli** | Interact with vaults via CLI, including plugin and theme development. |
| **defuddle** | Extract clean Markdown from web pages, reducing token usage. |

**Installation:** Clone the repo and place skill files where your agent reads skills from (e.g., `.claude/skills/`).

### Community PKM Workflows

| Project | What It Offers | Link |
|---|---|---|
| **obsidian-claude-pkm** (ballred) | 10 skills: `/daily`, `/weekly`, `/monthly`, `/project`, `/review`, `/push` (Git), `/onboard`, `/adopt`. Complete starter kit. | [GitHub](https://github.com/ballred/obsidian-claude-pkm) |
| **obsidian-claude** (ZanderRuss) | 31 commands, 27 agents, 19 skills. Full PARA-based research workflow with MCP integration. | [GitHub](https://github.com/ZanderRuss/obsidian-claude) |
| **claude-obsidian-skills** (jykim) | Fix broken wikilinks, ensure consistent frontmatter, generate Mermaid flowcharts, create knowledge map canvases. | [GitHub](https://github.com/jykim/claude-obsidian-skills) |

### Getting Started with Agent Skills

1. Open a terminal inside your Obsidian vault.
2. Clone the official skills: `git clone https://github.com/kepano/obsidian-skills.git .claude/skills/obsidian-skills`
3. Run Claude Code in your vault directory.
4. The agent now understands Obsidian-flavored Markdown, Canvas format, and Bases.

For a full PKM workflow, add `obsidian-claude-pkm` and run `/onboard` to set up your vault interactively.

---

## Canvas and Visual Knowledge Mapping

[Obsidian Canvas](https://obsidian.md/canvas) is an infinite spatial surface for arranging notes, images, links, and text cards.

### When to Use Canvas

- **Architecture diagrams** — map systems, services, and data flows.
- **Project planning** — arrange tasks and milestones spatially.
- **Research synthesis** — lay out sources and draw connections between ideas.
- **Decision matrices** — compare options visually.

### Canvas Format

Canvas files use the open [JSON Canvas](https://jsoncanvas.org) spec (v1.0):

- Files are `.canvas` (JSON under the hood).
- Nodes can be text, files (existing notes), links (URLs), or groups.
- Edges connect nodes with optional labels and colors.
- Coordinates can be negative — the canvas extends infinitely.
- AI agents with the `json-canvas` skill can generate canvases programmatically.

### Tips

- **Color-code categories.** Blue for people, yellow for events, green for decisions, red for blockers.
- **Use larger cards for key concepts** and smaller cards for supporting detail.
- **Embed existing notes** rather than duplicating content. A canvas node pointing to `[[Architecture Decision Records]]` stays in sync with the original note.
- **Install [Advanced Canvas](https://github.com/Developer-Mike/obsidian-advanced-canvas)** for graph-view integration, frontmatter-driven edges, and presentation mode.
