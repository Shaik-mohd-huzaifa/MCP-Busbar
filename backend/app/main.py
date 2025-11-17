from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import io
import zipfile
from .models import MCPServerConfig, MCPTool, MCPResource, MCPPrompt
from .mcp_generator import generate_mcp_server, generate_requirements_txt, generate_readme

app = FastAPI(title="Node-based UI API with MCP Support", version="2.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Data models
class Node(BaseModel):
    id: str
    type: str
    position: dict
    data: dict


class Edge(BaseModel):
    id: str
    source: str
    target: str


class FlowData(BaseModel):
    nodes: List[Node]
    edges: List[Edge]


# In-memory storage (replace with database in production)
flow_storage = {
    "nodes": [],
    "edges": []
}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Node-based UI API with MCP Support",
        "version": "2.0.0",
        "endpoints": {
            "flow": ["/nodes", "/edges", "/flow"],
            "mcp": ["/mcp/servers", "/mcp/server/{id}", "/mcp/generate/{id}", "/mcp/export/{id}", "/mcp/flow-to-server"]
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/nodes")
async def get_nodes():
    """Get all nodes"""
    return flow_storage["nodes"]


@app.post("/nodes")
async def create_node(node: Node):
    """Create a new node"""
    flow_storage["nodes"].append(node.dict())
    return {"message": "Node created", "node": node}


@app.get("/edges")
async def get_edges():
    """Get all edges"""
    return flow_storage["edges"]


@app.post("/edges")
async def create_edge(edge: Edge):
    """Create a new edge"""
    flow_storage["edges"].append(edge.dict())
    return {"message": "Edge created", "edge": edge}


@app.get("/flow")
async def get_flow():
    """Get the entire flow (nodes and edges)"""
    return flow_storage


@app.post("/flow")
async def save_flow(flow_data: FlowData):
    """Save the entire flow"""
    flow_storage["nodes"] = [node.dict() for node in flow_data.nodes]
    flow_storage["edges"] = [edge.dict() for edge in flow_data.edges]
    return {"message": "Flow saved successfully", "flow": flow_storage}


@app.delete("/flow")
async def clear_flow():
    """Clear all nodes and edges"""
    flow_storage["nodes"] = []
    flow_storage["edges"] = []
    return {"message": "Flow cleared"}


# ============================================
# MCP Server Endpoints
# ============================================

# In-memory storage for MCP servers
mcp_servers_storage: Dict[str, Dict[str, Any]] = {}


@app.post("/mcp/server")
async def create_mcp_server(config: MCPServerConfig):
    """Create or update an MCP server configuration"""
    mcp_servers_storage[config.id] = config.dict()
    return {"message": "MCP server configuration saved", "config": config}


@app.get("/mcp/servers")
async def get_mcp_servers():
    """Get all MCP server configurations"""
    return list(mcp_servers_storage.values())


@app.get("/mcp/server/{server_id}")
async def get_mcp_server(server_id: str):
    """Get a specific MCP server configuration"""
    if server_id not in mcp_servers_storage:
        raise HTTPException(status_code=404, detail="MCP server not found")
    return mcp_servers_storage[server_id]


@app.delete("/mcp/server/{server_id}")
async def delete_mcp_server(server_id: str):
    """Delete an MCP server configuration"""
    if server_id not in mcp_servers_storage:
        raise HTTPException(status_code=404, detail="MCP server not found")
    del mcp_servers_storage[server_id]
    return {"message": "MCP server deleted"}


@app.post("/mcp/generate/{server_id}")
async def generate_mcp_server_code(server_id: str):
    """Generate MCP server code from configuration"""
    if server_id not in mcp_servers_storage:
        raise HTTPException(status_code=404, detail="MCP server not found")

    config = mcp_servers_storage[server_id]
    server_code = generate_mcp_server(config)

    return {
        "code": server_code,
        "filename": f"{config['name'].lower().replace(' ', '_')}_server.py"
    }


@app.post("/mcp/export/{server_id}")
async def export_mcp_server(server_id: str):
    """Export MCP server as a ZIP file with all necessary files"""
    if server_id not in mcp_servers_storage:
        raise HTTPException(status_code=404, detail="MCP server not found")

    config = mcp_servers_storage[server_id]

    # Generate files
    server_code = generate_mcp_server(config)
    requirements = generate_requirements_txt()
    readme = generate_readme(config)

    # Create ZIP file in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        zip_file.writestr('server.py', server_code)
        zip_file.writestr('requirements.txt', requirements)
        zip_file.writestr('README.md', readme)

    zip_buffer.seek(0)

    filename = f"{config['name'].lower().replace(' ', '_')}_mcp_server.zip"

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.post("/mcp/flow-to-server")
async def convert_flow_to_mcp_server(flow_data: FlowData):
    """Convert a flow diagram to an MCP server configuration"""
    nodes = [node.dict() for node in flow_data.nodes]
    edges = [edge.dict() for edge in flow_data.edges]

    # Find the MCP server node
    server_node = None
    for node in nodes:
        if node.get('data', {}).get('nodeType') == 'mcp-server':
            server_node = node
            break

    if not server_node:
        raise HTTPException(status_code=400, detail="No MCP server node found in flow")

    # Extract tools, resources, and prompts from connected nodes
    tools = []
    resources = []
    prompts = []

    # Get connected nodes
    for edge in edges:
        if edge['target'] == server_node['id']:
            # Find the source node
            source_node = next((n for n in nodes if n['id'] == edge['source']), None)
            if source_node:
                node_type = source_node.get('data', {}).get('nodeType')
                config = source_node.get('data', {}).get('config', {})

                if node_type == 'mcp-tool':
                    tools.append({
                        'id': source_node['id'],
                        'name': config.get('name', 'unnamed_tool'),
                        'description': config.get('description', ''),
                        'input_schema': config.get('input_schema', {}),
                        'implementation': config.get('implementation', '')
                    })
                elif node_type == 'mcp-resource':
                    resources.append({
                        'id': source_node['id'],
                        'uri': config.get('uri', ''),
                        'name': config.get('name', 'unnamed_resource'),
                        'description': config.get('description', ''),
                        'mime_type': config.get('mime_type', 'text/plain')
                    })
                elif node_type == 'mcp-prompt':
                    prompts.append({
                        'id': source_node['id'],
                        'name': config.get('name', 'unnamed_prompt'),
                        'description': config.get('description', ''),
                        'arguments': config.get('arguments', []),
                        'template': config.get('template', '')
                    })

    server_config = {
        'id': server_node['id'],
        'name': server_node.get('data', {}).get('config', {}).get('name', 'My MCP Server'),
        'description': server_node.get('data', {}).get('config', {}).get('description', ''),
        'version': server_node.get('data', {}).get('config', {}).get('version', '1.0.0'),
        'tools': tools,
        'resources': resources,
        'prompts': prompts
    }

    # Save to storage
    mcp_servers_storage[server_node['id']] = server_config

    return {
        "message": "Flow converted to MCP server configuration",
        "config": server_config
    }
