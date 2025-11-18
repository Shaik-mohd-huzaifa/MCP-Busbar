import React, { useState, useCallback, useEffect } from 'react';
import Flow from './components/Flow';
import GoJSDiagram from './components/GoJSDiagram';
import HostedServers from './components/HostedServers';
import { flowAPI, mcpAPI } from './services/api';
import './styles/App.css';

function App() {
  const [currentFlow, setCurrentFlow] = useState({ nodes: [], edges: [] });
  const [statusMessage, setStatusMessage] = useState(null);
  const [apiHealth, setApiHealth] = useState(false);
  const [diagramMode, setDiagramMode] = useState('reactflow'); // 'reactflow' or 'gojs'
  const [viewMode, setViewMode] = useState('builder'); // 'builder' or 'hosted'
  const [lastServerId, setLastServerId] = useState(null);

  // Check API health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      await flowAPI.healthCheck();
      setApiHealth(true);
      showStatus('Connected to API', 'success');
    } catch (error) {
      setApiHealth(false);
      showStatus('API connection failed', 'error');
    }
  };

  const showStatus = (message, type = 'success') => {
    setStatusMessage({ message, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleFlowChange = useCallback((flow) => {
    setCurrentFlow(flow);
  }, []);

  const handleSaveFlow = async () => {
    try {
      await flowAPI.saveFlow(currentFlow);
      showStatus('Flow saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving flow:', error);
      showStatus('Failed to save flow', 'error');
    }
  };

  const handleLoadFlow = async () => {
    try {
      const flow = await flowAPI.getFlow();
      showStatus('Flow loaded successfully!', 'success');
      // Note: You would need to update the Flow component to accept external flow data
      console.log('Loaded flow:', flow);
    } catch (error) {
      console.error('Error loading flow:', error);
      showStatus('Failed to load flow', 'error');
    }
  };

  const handleClearFlow = async () => {
    if (window.confirm('Are you sure you want to clear the flow?')) {
      try {
        await flowAPI.clearFlow();
        showStatus('Flow cleared successfully!', 'success');
        window.location.reload(); // Simple way to reset the flow
      } catch (error) {
        console.error('Error clearing flow:', error);
        showStatus('Failed to clear flow', 'error');
      }
    }
  };

  const handleAddNode = () => {
    showStatus('Drag from a handle to create connections', 'success');
  };

  const handleGenerateMCPServer = async () => {
    try {
      const result = await mcpAPI.flowToServer(currentFlow);
      showStatus('MCP Server configuration created!', 'success');
      console.log('MCP Server Config:', result.config);

      // Automatically generate and show code
      if (result.config && result.config.id) {
        const codeResult = await mcpAPI.generateCode(result.config.id);
        console.log('Generated Code:', codeResult.code);
        showStatus('MCP Server code generated! Check console for code.', 'success');
      }
    } catch (error) {
      console.error('Error generating MCP server:', error);
      showStatus('Failed to generate MCP server', 'error');
    }
  };

  const handleExportMCPServer = async () => {
    try {
      // First convert flow to server
      const result = await mcpAPI.flowToServer(currentFlow);

      if (result.config && result.config.id) {
        // Then export as ZIP
        const blob = await mcpAPI.exportServer(result.config.id);

        // Download the file
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${result.config.name.toLowerCase().replace(/ /g, '_')}_mcp_server.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showStatus('MCP Server exported successfully!', 'success');
      }
    } catch (error) {
      console.error('Error exporting MCP server:', error);
      showStatus('Failed to export MCP server', 'error');
    }
  };

  const toggleDiagramMode = () => {
    const newMode = diagramMode === 'reactflow' ? 'gojs' : 'reactflow';
    setDiagramMode(newMode);
    showStatus(`Switched to ${newMode === 'gojs' ? 'GoJS' : 'React Flow'} mode`, 'success');
  };

  const handleDeployServer = async () => {
    try {
      // First convert flow to server
      const result = await mcpAPI.flowToServer(currentFlow);

      if (result.config && result.config.id) {
        // Deploy the server
        const deployResult = await mcpAPI.deployServer(result.config.id);

        setLastServerId(result.config.id);
        showStatus(`Server deployed! Access at ${deployResult.url}`, 'success');

        // Switch to hosted view
        setTimeout(() => setViewMode('hosted'), 1500);
      }
    } catch (error) {
      console.error('Error deploying server:', error);
      showStatus('Failed to deploy server', 'error');
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>MCP Busbar - MCP Server Platform</h1>
        <p>
          {viewMode === 'builder' ? 'Build and deploy MCP servers visually' : 'Manage your hosted MCP servers'}
          {apiHealth && ' • Connected to API'}
          {!apiHealth && ' • API Disconnected'}
          {viewMode === 'builder' && (
            <>
              {' • '}
              {diagramMode === 'gojs' ? 'GoJS Mode' : 'React Flow Mode'}
            </>
          )}
        </p>
      </header>

      <div className="view-tabs">
        <button
          className={`view-tab ${viewMode === 'builder' ? 'active' : ''}`}
          onClick={() => setViewMode('builder')}
        >
          🛠️ Builder
        </button>
        <button
          className={`view-tab ${viewMode === 'hosted' ? 'active' : ''}`}
          onClick={() => setViewMode('hosted')}
        >
          🚀 Hosted Servers
        </button>
      </div>

      {viewMode === 'builder' ? (
        <>
          <div className="controls">
            <button className="btn-primary" onClick={toggleDiagramMode}>
              Switch to {diagramMode === 'gojs' ? 'React Flow' : 'GoJS'}
            </button>
            <button className="btn-success" onClick={handleSaveFlow}>
              Save Flow
            </button>
            <button className="btn-info" onClick={handleLoadFlow}>
              Load Flow
            </button>
            <button className="btn-warning" onClick={handleGenerateMCPServer}>
              Generate Code
            </button>
            <button className="btn-deploy" onClick={handleDeployServer}>
              🚀 Deploy Server
            </button>
            <button className="btn-success" onClick={handleExportMCPServer}>
              Export ZIP
            </button>
            <button className="btn-danger" onClick={handleClearFlow}>
              Clear
            </button>
          </div>

          <div className="flow-container">
            {diagramMode === 'reactflow' ? (
              <Flow onFlowChange={handleFlowChange} />
            ) : (
              <GoJSDiagram onFlowChange={handleFlowChange} />
            )}
          </div>
        </>
      ) : (
        <div className="hosted-container">
          <HostedServers onStatusMessage={showStatus} />
        </div>
      )}

      {statusMessage && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.message}
        </div>
      )}
    </div>
  );
}

export default App;
