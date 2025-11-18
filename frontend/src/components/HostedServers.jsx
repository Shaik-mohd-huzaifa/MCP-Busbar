import React, { useState, useEffect } from 'react';
import { mcpAPI } from '../services/api';
import '../styles/HostedServers.css';

const HostedServers = ({ onStatusMessage }) => {
  const [hostedServers, setHostedServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);

  const loadHostedServers = async () => {
    try {
      setLoading(true);
      const result = await mcpAPI.listHostedServers();
      setHostedServers(result.servers || []);
    } catch (error) {
      console.error('Error loading hosted servers:', error);
      onStatusMessage?.('Failed to load hosted servers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHostedServers();
    // Refresh every 5 seconds
    const interval = setInterval(loadHostedServers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStop = async (serverId) => {
    if (!window.confirm('Are you sure you want to stop this server?')) {
      return;
    }

    try {
      await mcpAPI.undeployServer(serverId);
      onStatusMessage?.('Server stopped successfully', 'success');
      loadHostedServers();
    } catch (error) {
      console.error('Error stopping server:', error);
      onStatusMessage?.('Failed to stop server', 'error');
    }
  };

  const handleRestart = async (serverId) => {
    try {
      await mcpAPI.restartServer(serverId);
      onStatusMessage?.('Server restarted successfully', 'success');
      loadHostedServers();
    } catch (error) {
      console.error('Error restarting server:', error);
      onStatusMessage?.('Failed to restart server', 'error');
    }
  };

  const handleViewInfo = async (serverId) => {
    try {
      const info = await mcpAPI.getServerInfo(serverId);
      setSelectedServer(info);
    } catch (error) {
      console.error('Error getting server info:', error);
      onStatusMessage?.('Failed to get server info', 'error');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    onStatusMessage?.('Copied to clipboard!', 'success');
  };

  return (
    <div className="hosted-servers">
      <div className="hosted-servers-header">
        <h2>Hosted MCP Servers</h2>
        <button className="btn-refresh" onClick={loadHostedServers} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {hostedServers.length === 0 ? (
        <div className="empty-state">
          <p>No servers deployed yet</p>
          <small>Deploy a server from the builder to see it here</small>
        </div>
      ) : (
        <div className="servers-grid">
          {hostedServers.map((server) => (
            <div key={server.server_id} className="server-card">
              <div className="server-card-header">
                <h3>{server.name}</h3>
                <span className={`status-badge ${server.status}`}>
                  {server.status}
                </span>
              </div>

              <div className="server-card-body">
                <div className="server-info-row">
                  <strong>Server ID:</strong>
                  <code>{server.server_id}</code>
                </div>

                <div className="server-info-row">
                  <strong>URL:</strong>
                  <div className="url-container">
                    <code>/mcp/{server.server_id}</code>
                    <button
                      className="btn-copy"
                      onClick={() => copyToClipboard(`/mcp/${server.server_id}`)}
                      title="Copy URL"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>

              <div className="server-card-actions">
                <button
                  className="btn-small btn-info"
                  onClick={() => handleViewInfo(server.server_id)}
                >
                  Info
                </button>
                <button
                  className="btn-small btn-warning"
                  onClick={() => handleRestart(server.server_id)}
                >
                  Restart
                </button>
                <button
                  className="btn-small btn-danger"
                  onClick={() => handleStop(server.server_id)}
                >
                  Stop
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedServer && (
        <div className="modal-overlay" onClick={() => setSelectedServer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedServer.name}</h2>
              <button className="btn-close" onClick={() => setSelectedServer(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="info-section">
                <h3>Server Details</h3>
                <p><strong>Description:</strong> {selectedServer.description}</p>
                <p><strong>Version:</strong> {selectedServer.version}</p>
                <p><strong>Status:</strong> <span className={`status-badge ${selectedServer.status}`}>{selectedServer.status}</span></p>
                <p><strong>URL:</strong> <code>{selectedServer.url}</code></p>
              </div>

              {selectedServer.tools && selectedServer.tools.length > 0 && (
                <div className="info-section">
                  <h3>Tools ({selectedServer.tools.length})</h3>
                  <ul className="items-list">
                    {selectedServer.tools.map((tool, idx) => (
                      <li key={idx}>
                        <strong>{tool.name}</strong>: {tool.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedServer.resources && selectedServer.resources.length > 0 && (
                <div className="info-section">
                  <h3>Resources ({selectedServer.resources.length})</h3>
                  <ul className="items-list">
                    {selectedServer.resources.map((resource, idx) => (
                      <li key={idx}>
                        <strong>{resource.name}</strong>: {resource.description}
                        <br />
                        <code>{resource.uri}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedServer.prompts && selectedServer.prompts.length > 0 && (
                <div className="info-section">
                  <h3>Prompts ({selectedServer.prompts.length})</h3>
                  <ul className="items-list">
                    {selectedServer.prompts.map((prompt, idx) => (
                      <li key={idx}>
                        <strong>{prompt.name}</strong>: {prompt.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostedServers;
