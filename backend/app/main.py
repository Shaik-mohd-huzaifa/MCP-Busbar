from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Node-based UI API", version="1.0.0")

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
        "message": "Welcome to Node-based UI API",
        "version": "1.0.0",
        "endpoints": ["/nodes", "/edges", "/flow"]
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
