# MCP configuration

`.mcp.json` records two optional development integrations:

- filesystem access limited to the repository root;
- GitHub Issues/Actions access using `GITHUB_PERSONAL_ACCESS_TOKEN` supplied only through the environment.

The token value is never stored in the repository. The application itself does not require MCP servers at runtime.

