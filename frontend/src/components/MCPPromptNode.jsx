import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import '../styles/NodeStyles.css';

const MCPPromptNode = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [config, setConfig] = useState(data.config || {
    name: 'my_prompt',
    description: 'A prompt description',
    arguments: [],
    template: 'Your prompt template here. Use {{variable}} for arguments.'
  });

  const handleConfigChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    if (data.onConfigChange) {
      data.onConfigChange(newConfig);
    }
  };

  return (
    <div className={`custom-node mcp-prompt-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />

      <div className="node-header">
        <span className="node-icon">💬</span>
        {data.label || 'MCP Prompt'}
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
            placeholder="Prompt Name"
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
            placeholder="Template (use {{variable}} for arguments)"
            value={config.template}
            onChange={(e) => handleConfigChange('template', e.target.value)}
            rows="6"
          />
          <textarea
            className="node-textarea"
            placeholder="Arguments (JSON array)"
            value={JSON.stringify(config.arguments, null, 2)}
            onChange={(e) => {
              try {
                const args = JSON.parse(e.target.value);
                handleConfigChange('arguments', args);
              } catch (err) {
                // Invalid JSON, don't update
              }
            }}
            rows="4"
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

export default memo(MCPPromptNode);
