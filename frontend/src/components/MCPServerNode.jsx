import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import '../styles/NodeStyles.css';

const MCPServerNode = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [config, setConfig] = useState(data.config || {
    name: 'My MCP Server',
    description: 'An MCP server',
    version: '1.0.0'
  });

  const handleConfigChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    if (data.onConfigChange) {
      data.onConfigChange(newConfig);
    }
  };

  return (
    <div className={`custom-node mcp-server-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />

      <div className="node-header">
        <span className="node-icon">🖥️</span>
        {data.label || 'MCP Server'}
      </div>

      {!isEditing ? (
        <div className="node-content">
          <div className="node-info">
            <strong>{config.name}</strong>
            <p>{config.description}</p>
            <small>Version: {config.version}</small>
          </div>
          <button
            className="node-button"
            onClick={() => setIsEditing(true)}
          >
            Configure
          </button>
        </div>
      ) : (
        <div className="node-form">
          <input
            className="node-input"
            type="text"
            placeholder="Server Name"
            value={config.name}
            onChange={(e) => handleConfigChange('name', e.target.value)}
          />
          <textarea
            className="node-textarea"
            placeholder="Description"
            value={config.description}
            onChange={(e) => handleConfigChange('description', e.target.value)}
            rows="3"
          />
          <input
            className="node-input"
            type="text"
            placeholder="Version"
            value={config.version}
            onChange={(e) => handleConfigChange('version', e.target.value)}
          />
          <button
            className="node-button"
            onClick={() => setIsEditing(false)}
          >
            Done
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  );
};

export default memo(MCPServerNode);
