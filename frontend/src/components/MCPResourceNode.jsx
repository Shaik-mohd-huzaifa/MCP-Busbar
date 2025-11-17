import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import '../styles/NodeStyles.css';

const MCPResourceNode = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [config, setConfig] = useState(data.config || {
    uri: 'file:///path/to/resource',
    name: 'my_resource',
    description: 'A resource description',
    mime_type: 'text/plain'
  });

  const handleConfigChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    if (data.onConfigChange) {
      data.onConfigChange(newConfig);
    }
  };

  return (
    <div className={`custom-node mcp-resource-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />

      <div className="node-header">
        <span className="node-icon">📄</span>
        {data.label || 'MCP Resource'}
      </div>

      {!isEditing ? (
        <div className="node-content">
          <div className="node-info">
            <strong>{config.name}</strong>
            <p>{config.description}</p>
            <small>{config.uri}</small>
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
            placeholder="Resource Name"
            value={config.name}
            onChange={(e) => handleConfigChange('name', e.target.value)}
          />
          <input
            className="node-input"
            type="text"
            placeholder="URI (e.g., file:///path/to/file)"
            value={config.uri}
            onChange={(e) => handleConfigChange('uri', e.target.value)}
          />
          <textarea
            className="node-textarea"
            placeholder="Description"
            value={config.description}
            onChange={(e) => handleConfigChange('description', e.target.value)}
            rows="2"
          />
          <input
            className="node-input"
            type="text"
            placeholder="MIME Type"
            value={config.mime_type}
            onChange={(e) => handleConfigChange('mime_type', e.target.value)}
          />
          <button
            className="node-button"
            onClick={() => setIsEditing(false)}
          >
            Done
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(MCPResourceNode);
