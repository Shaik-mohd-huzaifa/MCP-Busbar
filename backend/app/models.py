from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class MCPTool(BaseModel):
    """Represents an MCP tool"""
    id: str
    name: str
    description: str
    input_schema: Dict[str, Any]
    implementation: Optional[str] = None


class MCPResource(BaseModel):
    """Represents an MCP resource"""
    id: str
    uri: str
    name: str
    description: str
    mime_type: Optional[str] = "text/plain"


class MCPPrompt(BaseModel):
    """Represents an MCP prompt"""
    id: str
    name: str
    description: str
    arguments: Optional[List[Dict[str, Any]]] = []
    template: str


class MCPServerConfig(BaseModel):
    """MCP Server configuration"""
    id: str
    name: str
    description: str
    version: str = "1.0.0"
    tools: List[MCPTool] = []
    resources: List[MCPResource] = []
    prompts: List[MCPPrompt] = []


class MCPNodeData(BaseModel):
    """Extended node data for MCP nodes"""
    node_type: str  # "mcp-server", "mcp-tool", "mcp-resource", "mcp-prompt"
    label: str
    description: str
    config: Dict[str, Any] = {}
