import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import '../styles/NodeStyles.css';

const MCPToolNode = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [config, setConfig] = useState(data.config || {
    name: 'my_tool',
    description: 'A tool description',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    },
    implementation: '# TODO: Implement tool\nreturn "Result"'
  });

  const handleConfigChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    if (data.onConfigChange) {
      data.onConfigChange(newConfig);
    }
  };

  return (
    <div className={`custom-node mcp-tool-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />

      <div className="node-header">
        <span className="node-icon">🔧</span>
        {data.label || 'MCP Tool'}
      </div>

      {!isEditing ? (
        <div className="node-content">
          <div className="node-info">
            <strong>{config.name}</strong>
            <p>{config.description}</p>
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
            placeholder="Tool Name (e.g., my_tool)"
            value={config.name}
            onChange={(e) => handleConfigChange('name', e.target.value)}
          />
          <textarea
            className="node-textarea"
            placeholder="Description"
            value={config.description}
            onChange={(e) => handleConfigChange('description', e.target.value)}
            rows="2"
          />
          <textarea
            className="node-textarea"
            placeholder="Input Schema (JSON)"
            value={JSON.stringify(config.input_schema, null, 2)}
            onChange={(e) => {
              try {
                const schema = JSON.parse(e.target.value);
                handleConfigChange('input_schema', schema);
              } catch (err) {
                // Invalid JSON, don't update
              }
            }}
            rows="4"
          />
          <textarea
            className="node-textarea"
            placeholder="Implementation (Python code)"
            value={config.implementation}
            onChange={(e) => handleConfigChange('implementation', e.target.value)}
            rows="6"
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

export default memo(MCPToolNode);
