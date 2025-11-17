import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

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

export default api;
