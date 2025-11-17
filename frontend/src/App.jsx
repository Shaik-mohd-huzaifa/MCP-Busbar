import React, { useState, useCallback, useEffect } from 'react';
import Flow from './components/Flow';
import { flowAPI } from './services/api';
import './styles/App.css';

function App() {
  const [currentFlow, setCurrentFlow] = useState({ nodes: [], edges: [] });
  const [statusMessage, setStatusMessage] = useState(null);
  const [apiHealth, setApiHealth] = useState(false);

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

  return (
    <div className="app">
      <header className="header">
        <h1>MCP Busbar - Node-based UI</h1>
        <p>
          Create and connect nodes to build your flow
          {apiHealth && ' • Connected to API'}
          {!apiHealth && ' • API Disconnected'}
        </p>
      </header>

      <div className="controls">
        <button className="btn-primary" onClick={handleAddNode}>
          Add Node (coming soon)
        </button>
        <button className="btn-success" onClick={handleSaveFlow}>
          Save Flow
        </button>
        <button className="btn-info" onClick={handleLoadFlow}>
          Load Flow
        </button>
        <button className="btn-danger" onClick={handleClearFlow}>
          Clear Flow
        </button>
        <button className="btn-info" onClick={checkHealth}>
          Check API
        </button>
      </div>

      <div className="flow-container">
        <Flow onFlowChange={handleFlowChange} />
      </div>

      {statusMessage && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.message}
        </div>
      )}
    </div>
  );
}

export default App;
