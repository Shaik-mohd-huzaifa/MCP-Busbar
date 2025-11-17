"""
MCP Server Code Generator
Generates Python code for MCP servers based on configuration
"""

from typing import Dict, List
import json


def generate_tool_code(tool: Dict) -> str:
    """Generate code for an MCP tool"""
    tool_name = tool['name']
    description = tool['description']
    input_schema = json.dumps(tool.get('input_schema', {}), indent=8)

    implementation = tool.get('implementation', '# TODO: Implement tool logic\n    return "Not implemented"')

    return f'''
@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """
    Handle tool execution requests
    """
    if name == "{tool_name}":
        # {description}
        {implementation}

    raise ValueError(f"Unknown tool: {{name}}")
'''


def generate_resource_code(resource: Dict) -> str:
    """Generate code for an MCP resource"""
    uri = resource['uri']
    name = resource['name']
    description = resource['description']

    return f'''
    # Resource: {name}
    # URI: {uri}
    # Description: {description}
    Resource(
        uri=AnyUrl("{uri}"),
        name="{name}",
        description="{description}",
        mimeType="{resource.get('mime_type', 'text/plain')}"
    ),
'''


def generate_prompt_code(prompt: Dict) -> str:
    """Generate code for an MCP prompt"""
    prompt_name = prompt['name']
    description = prompt['description']
    template = prompt['template']
    arguments = prompt.get('arguments', [])

    args_code = ",\n            ".join([
        f'PromptArgument(name="{arg["name"]}", description="{arg.get("description", "")}", required={arg.get("required", True)})'
        for arg in arguments
    ])

    return f'''
@server.list_prompts()
async def list_prompts() -> list[Prompt]:
    """
    List available prompts
    """
    return [
        Prompt(
            name="{prompt_name}",
            description="{description}",
            arguments=[
                {args_code}
            ] if {len(arguments) > 0} else []
        )
    ]

@server.get_prompt()
async def get_prompt(name: str, arguments: dict | None = None) -> GetPromptResult:
    """
    Get a specific prompt
    """
    if name == "{prompt_name}":
        # {description}
        template = """{template}"""

        # Replace template variables with arguments
        if arguments:
            for key, value in arguments.items():
                template = template.replace(f"{{{{{key}}}}}", str(value))

        return GetPromptResult(
            description="{description}",
            messages=[
                PromptMessage(
                    role="user",
                    content=TextContent(
                        type="text",
                        text=template
                    )
                )
            ]
        )

    raise ValueError(f"Unknown prompt: {{name}}")
'''


def generate_mcp_server(config: Dict) -> str:
    """Generate complete MCP server code"""

    server_name = config['name']
    description = config['description']
    version = config.get('version', '1.0.0')
    tools = config.get('tools', [])
    resources = config.get('resources', [])
    prompts = config.get('prompts', [])

    # Generate tools schema
    tools_list = []
    for tool in tools:
        tool_schema = {
            "name": tool['name'],
            "description": tool['description'],
            "inputSchema": tool.get('input_schema', {
                "type": "object",
                "properties": {},
                "required": []
            })
        }
        tools_list.append(f"    Tool(\n        name=\"{tool['name']}\",\n        description=\"{tool['description']}\",\n        inputSchema={json.dumps(tool.get('input_schema', {}), indent=8)}\n    )")

    tools_code = ",\n".join(tools_list) if tools_list else ""

    # Generate resources code
    resources_code = "\n".join([generate_resource_code(r) for r in resources]) if resources else ""

    # Generate tool handlers
    tool_handlers = "\n".join([generate_tool_code(t) for t in tools]) if tools else ""

    # Generate prompt handlers
    prompt_handlers = "\n".join([generate_prompt_code(p) for p in prompts]) if prompts else ""

    server_code = f'''#!/usr/bin/env python3
"""
{server_name}
{description}

Generated MCP Server - Version {version}
"""

import asyncio
import json
from typing import Any
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Resource,
    Tool,
    TextContent,
    ImageContent,
    EmbeddedResource,
    Prompt,
    PromptArgument,
    PromptMessage,
    GetPromptResult,
)
from pydantic import AnyUrl

# Initialize MCP server
server = Server("{server_name}")


@server.list_resources()
async def list_resources() -> list[Resource]:
    """
    List available resources
    """
    return [
{resources_code if resources_code else "        # No resources defined"}
    ]


@server.read_resource()
async def read_resource(uri: AnyUrl) -> str:
    """
    Read a specific resource
    """
    # TODO: Implement resource reading logic
    return f"Content of resource: {{uri}}"


@server.list_tools()
async def list_tools() -> list[Tool]:
    """
    List available tools
    """
    return [
{tools_code if tools_code else "        # No tools defined"}
    ]

{tool_handlers if tool_handlers else "# No tool handlers defined"}

{prompt_handlers if prompt_handlers else "# No prompt handlers defined"}


async def main():
    """
    Main entry point for the MCP server
    """
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )


if __name__ == "__main__":
    asyncio.run(main())
'''

    return server_code


def generate_requirements_txt() -> str:
    """Generate requirements.txt for MCP server"""
    return """mcp>=0.1.0
pydantic>=2.0.0
"""


def generate_readme(config: Dict) -> str:
    """Generate README for MCP server"""
    server_name = config['name']
    description = config['description']
    tools = config.get('tools', [])
    resources = config.get('resources', [])
    prompts = config.get('prompts', [])

    tools_section = "\n".join([f"- **{t['name']}**: {t['description']}" for t in tools])
    resources_section = "\n".join([f"- **{r['name']}** (`{r['uri']}`): {r['description']}" for r in resources])
    prompts_section = "\n".join([f"- **{p['name']}**: {p['description']}" for p in prompts])

    return f"""# {server_name}

{description}

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

```bash
python server.py
```

## Features

### Tools
{tools_section if tools else "No tools defined"}

### Resources
{resources_section if resources else "No resources defined"}

### Prompts
{prompts_section if prompts else "No prompts defined"}

## Configuration

This MCP server was generated using MCP-Busbar.

## Usage with Claude Desktop

Add this server to your Claude Desktop configuration:

```json
{{
  "mcpServers": {{
    "{server_name.lower().replace(' ', '-')}": {{
      "command": "python",
      "args": ["/path/to/server.py"]
    }}
  }}
}}
```

## Development

Edit `server.py` to customize the implementation of tools, resources, and prompts.
"""
