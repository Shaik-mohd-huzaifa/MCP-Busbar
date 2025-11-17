import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import '../styles/NodeStyles.css';

const CustomNode = ({ data, selected }) => {
  return (
    <div className={`custom-node ${data.nodeType || ''} ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />

      <div className="node-header">
        {data.label || 'Node'}
      </div>

      <div className="node-content">
        {data.description || 'Custom node'}
      </div>

      {data.showInput && (
        <input
          className="node-input"
          type="text"
          placeholder="Enter value..."
          defaultValue={data.value || ''}
          onChange={(e) => {
            if (data.onChange) {
              data.onChange(e.target.value);
            }
          }}
        />
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(CustomNode);
