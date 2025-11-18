import axios from 'axios';

// Use environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const flowAPI = {
  // Get all nodes
  getNodes: async () => {
    const response = await api.get('/nodes');
    return response.data;
  },

  // Create a node
  createNode: async (node) => {
    const response = await api.post('/nodes', node);
    return response.data;
  },

  // Get all edges
  getEdges: async () => {
    const response = await api.get('/edges');
    return response.data;
  },

  // Create an edge
  createEdge: async (edge) => {
    const response = await api.post('/edges', edge);
    return response.data;
  },

  // Get entire flow
  getFlow: async () => {
    const response = await api.get('/flow');
    return response.data;
  },

  // Save entire flow
  saveFlow: async (flowData) => {
    const response = await api.post('/flow', flowData);
    return response.data;
  },

  // Clear flow
  clearFlow: async () => {
    const response = await api.delete('/flow');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export const mcpAPI = {
  // Create/update MCP server
  createServer: async (config) => {
    const response = await api.post('/mcp/server', config);
    return response.data;
  },

  // Get all MCP servers
  getServers: async () => {
    const response = await api.get('/mcp/servers');
    return response.data;
  },

  // Get specific MCP server
  getServer: async (serverId) => {
    const response = await api.get(`/mcp/server/${serverId}`);
    return response.data;
  },

  // Delete MCP server
  deleteServer: async (serverId) => {
    const response = await api.delete(`/mcp/server/${serverId}`);
    return response.data;
  },

  // Generate MCP server code
  generateCode: async (serverId) => {
    const response = await api.post(`/mcp/generate/${serverId}`);
    return response.data;
  },

  // Export MCP server as ZIP
  exportServer: async (serverId) => {
    const response = await api.post(`/mcp/export/${serverId}`, {}, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Convert flow to MCP server
  flowToServer: async (flowData) => {
    const response = await api.post('/mcp/flow-to-server', flowData);
    return response.data;
  },

  // ===== Hosted Server Management =====

  // Deploy server to hosting platform
  deployServer: async (serverId) => {
    const response = await api.post(`/mcp/deploy/${serverId}`);
    return response.data;
  },

  // Stop hosted server
  undeployServer: async (serverId) => {
    const response = await api.delete(`/mcp/deploy/${serverId}`);
    return response.data;
  },

  // Restart hosted server
  restartServer: async (serverId) => {
    const response = await api.post(`/mcp/deploy/${serverId}/restart`);
    return response.data;
  },

  // List all hosted servers
  listHostedServers: async () => {
    const response = await api.get('/mcp/hosted');
    return response.data;
  },

  // Get hosted server status
  getServerStatus: async (serverId) => {
    const response = await api.get(`/mcp/hosted/${serverId}/status`);
    return response.data;
  },

  // Get hosted server info
  getServerInfo: async (serverId) => {
    const response = await api.get(`/mcp/${serverId}/info`);
    return response.data;
  },

  // Call tool on hosted server
  callTool: async (serverId, toolName, arguments) => {
    const response = await api.post(`/mcp/${serverId}/tools/call`, {
      tool_name: toolName,
      arguments: arguments
    });
    return response.data;
  },
};

export default api;
