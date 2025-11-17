import React, { useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import MCPServerNode from './MCPServerNode';
import MCPToolNode from './MCPToolNode';
import MCPResourceNode from './MCPResourceNode';
import MCPPromptNode from './MCPPromptNode';
import '../styles/NodeStyles.css';

const nodeTypes = {
  custom: CustomNode,
  mcpServer: MCPServerNode,
  mcpTool: MCPToolNode,
  mcpResource: MCPResourceNode,
  mcpPrompt: MCPPromptNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'custom',
    position: { x: 250, y: 50 },
    data: {
      label: 'Input Node',
      description: 'Start here',
      nodeType: 'input-node',
      showInput: true,
    },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 250, y: 200 },
    data: {
      label: 'Process Node',
      description: 'Processing data',
      nodeType: 'process-node',
    },
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 250, y: 350 },
    data: {
      label: 'Output Node',
      description: 'Final result',
      nodeType: 'output-node',
    },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
];

const Flow = ({ onFlowChange }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge({ ...params, animated: true }, edges);
      setEdges(newEdges);
      if (onFlowChange) {
        onFlowChange({ nodes, edges: newEdges });
      }
    },
    [edges, nodes, onFlowChange, setEdges]
  );

  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      if (onFlowChange) {
        // Delay to ensure state is updated
        setTimeout(() => {
          onFlowChange({ nodes, edges });
        }, 0);
      }
    },
    [nodes, edges, onNodesChange, onFlowChange]
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      if (onFlowChange) {
        setTimeout(() => {
          onFlowChange({ nodes, edges });
        }, 0);
      }
    },
    [nodes, edges, onEdgesChange, onFlowChange]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      attributionPosition="bottom-left"
    >
      <Controls />
      <MiniMap
        nodeStrokeColor={(n) => {
          if (n.data.nodeType === 'input-node') return '#51cf66';
          if (n.data.nodeType === 'output-node') return '#ff6b6b';
          if (n.data.nodeType === 'process-node') return '#339af0';
          return '#667eea';
        }}
        nodeColor={(n) => {
          if (n.data.nodeType === 'input-node') return '#d3f9d8';
          if (n.data.nodeType === 'output-node') return '#ffe3e3';
          if (n.data.nodeType === 'process-node') return '#d0ebff';
          return '#e5dbff';
        }}
        nodeBorderRadius={8}
      />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  );
};

export default Flow;
