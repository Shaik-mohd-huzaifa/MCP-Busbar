import React, { useEffect, useRef } from 'react';
import * as go from 'gojs';

const GoJSDiagram = ({ onFlowChange }) => {
  const diagramRef = useRef(null);
  const diagramInstanceRef = useRef(null);

  useEffect(() => {
    const $ = go.GraphObject.make;

    // Create the diagram
    const diagram = $(go.Diagram, diagramRef.current, {
      'undoManager.isEnabled': true,
      layout: $(go.TreeLayout, {
        angle: 90,
        layerSpacing: 50,
        nodeSpacing: 30,
      }),
      model: new go.GraphLinksModel({
        linkKeyProperty: 'key',
      }),
    });

    // Define node templates

    // MCP Server Node Template
    diagram.nodeTemplateMap.add(
      'mcpServer',
      $(
        go.Node,
        'Auto',
        { locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(
          go.Shape,
          'RoundedRectangle',
          {
            fill: '#f8f0ff',
            stroke: '#9775fa',
            strokeWidth: 3,
            portId: '',
            fromLinkable: false,
            toLinkable: true,
            cursor: 'pointer',
          }
        ),
        $(
          go.Panel,
          'Vertical',
          { margin: 12 },
          $(
            go.TextBlock,
            {
              font: 'bold 14px sans-serif',
              margin: new go.Margin(0, 0, 5, 0),
            },
            new go.Binding('text', 'title')
          ),
          $(
            go.TextBlock,
            {
              font: '11px sans-serif',
              stroke: '#666',
              maxSize: new go.Size(200, NaN),
              wrap: go.TextBlock.WrapFit,
            },
            new go.Binding('text', 'description')
          ),
          $(
            go.TextBlock,
            {
              font: '10px sans-serif',
              stroke: '#999',
              margin: new go.Margin(5, 0, 0, 0),
            },
            new go.Binding('text', 'version', (v) => `Version: ${v}`)
          )
        )
      )
    );

    // MCP Tool Node Template
    diagram.nodeTemplateMap.add(
      'mcpTool',
      $(
        go.Node,
        'Auto',
        { locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(
          go.Shape,
          'RoundedRectangle',
          {
            fill: 'white',
            stroke: '#ff922b',
            strokeWidth: 2,
            portId: '',
            fromLinkable: true,
            toLinkable: false,
            cursor: 'pointer',
          }
        ),
        $(
          go.Panel,
          'Vertical',
          { margin: 10 },
          $(
            go.Panel,
            'Horizontal',
            $(
              go.TextBlock,
              {
                text: '🔧',
                font: '16px sans-serif',
                margin: new go.Margin(0, 5, 0, 0),
              }
            ),
            $(
              go.TextBlock,
              {
                font: 'bold 12px sans-serif',
              },
              new go.Binding('text', 'toolName')
            )
          ),
          $(
            go.TextBlock,
            {
              font: '10px sans-serif',
              stroke: '#666',
              maxSize: new go.Size(180, NaN),
              wrap: go.TextBlock.WrapFit,
              margin: new go.Margin(5, 0, 0, 0),
            },
            new go.Binding('text', 'description')
          )
        )
      )
    );

    // MCP Resource Node Template
    diagram.nodeTemplateMap.add(
      'mcpResource',
      $(
        go.Node,
        'Auto',
        { locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(
          go.Shape,
          'RoundedRectangle',
          {
            fill: 'white',
            stroke: '#20c997',
            strokeWidth: 2,
            portId: '',
            fromLinkable: true,
            toLinkable: false,
            cursor: 'pointer',
          }
        ),
        $(
          go.Panel,
          'Vertical',
          { margin: 10 },
          $(
            go.Panel,
            'Horizontal',
            $(
              go.TextBlock,
              {
                text: '📄',
                font: '16px sans-serif',
                margin: new go.Margin(0, 5, 0, 0),
              }
            ),
            $(
              go.TextBlock,
              {
                font: 'bold 12px sans-serif',
              },
              new go.Binding('text', 'resourceName')
            )
          ),
          $(
            go.TextBlock,
            {
              font: '10px sans-serif',
              stroke: '#666',
              maxSize: new go.Size(180, NaN),
              wrap: go.TextBlock.WrapFit,
              margin: new go.Margin(5, 0, 0, 0),
            },
            new go.Binding('text', 'description')
          ),
          $(
            go.TextBlock,
            {
              font: '9px sans-serif',
              stroke: '#999',
              margin: new go.Margin(3, 0, 0, 0),
            },
            new go.Binding('text', 'uri')
          )
        )
      )
    );

    // MCP Prompt Node Template
    diagram.nodeTemplateMap.add(
      'mcpPrompt',
      $(
        go.Node,
        'Auto',
        { locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(
          go.Shape,
          'RoundedRectangle',
          {
            fill: 'white',
            stroke: '#4dabf7',
            strokeWidth: 2,
            portId: '',
            fromLinkable: true,
            toLinkable: false,
            cursor: 'pointer',
          }
        ),
        $(
          go.Panel,
          'Vertical',
          { margin: 10 },
          $(
            go.Panel,
            'Horizontal',
            $(
              go.TextBlock,
              {
                text: '💬',
                font: '16px sans-serif',
                margin: new go.Margin(0, 5, 0, 0),
              }
            ),
            $(
              go.TextBlock,
              {
                font: 'bold 12px sans-serif',
              },
              new go.Binding('text', 'promptName')
            )
          ),
          $(
            go.TextBlock,
            {
              font: '10px sans-serif',
              stroke: '#666',
              maxSize: new go.Size(180, NaN),
              wrap: go.TextBlock.WrapFit,
              margin: new go.Margin(5, 0, 0, 0),
            },
            new go.Binding('text', 'description')
          )
        )
      )
    );

    // Default node template (for backward compatibility)
    diagram.nodeTemplate = $(
      go.Node,
      'Auto',
      { locationSpot: go.Spot.Center },
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      $(
        go.Shape,
        'RoundedRectangle',
        {
          fill: 'white',
          stroke: '#667eea',
          strokeWidth: 2,
          portId: '',
          fromLinkable: true,
          toLinkable: true,
          cursor: 'pointer',
        }
      ),
      $(
        go.TextBlock,
        {
          font: '12px sans-serif',
          margin: 10,
        },
        new go.Binding('text', 'text')
      )
    );

    // Link template
    diagram.linkTemplate = $(
      go.Link,
      {
        routing: go.Link.AvoidsNodes,
        curve: go.Link.JumpOver,
        corner: 5,
        toShortLength: 4,
        relinkableFrom: true,
        relinkableTo: true,
        reshapable: true,
        resegmentable: true,
      },
      $(go.Shape, { stroke: '#667eea', strokeWidth: 2 }),
      $(go.Shape, { toArrow: 'Standard', stroke: '#667eea', fill: '#667eea' })
    );

    // Initial sample data
    diagram.model = new go.GraphLinksModel(
      [
        {
          key: 'server1',
          category: 'mcpServer',
          title: 'My MCP Server',
          description: 'A custom MCP server',
          version: '1.0.0',
          loc: '400 50',
        },
        {
          key: 'tool1',
          category: 'mcpTool',
          toolName: 'example_tool',
          description: 'An example tool for the MCP server',
          loc: '200 200',
        },
        {
          key: 'resource1',
          category: 'mcpResource',
          resourceName: 'my_resource',
          description: 'A sample resource',
          uri: 'file:///path/to/resource',
          loc: '400 200',
        },
        {
          key: 'prompt1',
          category: 'mcpPrompt',
          promptName: 'my_prompt',
          description: 'A sample prompt template',
          loc: '600 200',
        },
      ],
      [
        { key: 'link1', from: 'tool1', to: 'server1' },
        { key: 'link2', from: 'resource1', to: 'server1' },
        { key: 'link3', from: 'prompt1', to: 'server1' },
      ]
    );

    // Listen for model changes
    diagram.addModelChangedListener((evt) => {
      if (evt.isTransactionFinished && onFlowChange) {
        const nodes = [];
        const edges = [];

        diagram.model.nodeDataArray.forEach((node) => {
          nodes.push({
            id: node.key,
            type: node.category || 'default',
            position: go.Point.parse(node.loc || '0 0'),
            data: node,
          });
        });

        diagram.model.linkDataArray.forEach((link) => {
          edges.push({
            id: link.key,
            source: link.from,
            target: link.to,
          });
        });

        onFlowChange({ nodes, edges });
      }
    });

    diagramInstanceRef.current = diagram;

    return () => {
      diagram.div = null;
    };
  }, [onFlowChange]);

  return (
    <div
      ref={diagramRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#fafafa',
      }}
    />
  );
};

export default GoJSDiagram;
