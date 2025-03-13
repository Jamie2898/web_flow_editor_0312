import React, { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeType } from '../../types';
import { Button, Menu, Dropdown, Modal, notification } from 'antd';
import { DownOutlined, PlusOutlined, SaveOutlined, UploadOutlined, FileOutlined, ClearOutlined, EyeOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { Node } from 'reactflow';

interface NodeProps {
  data: {
    label: string;
    nodeType: NodeType;
  };
  selected: boolean;
}

// Use the same colors as defined in FlowEditor
const nodeColors = {
  start: '#4CAF50',     // Green for start nodes
  end: '#F44336',       // Red for end nodes
  persuader: '#2196F3', // Blue for persuader nodes
  collector: '#FF9800', // Orange for collector nodes
  selector: '#9C27B0',  // Purple for selector nodes
  global_node: '#607D8B', // Blue-grey for global nodes
};

// Define styles based on the main colors
const nodeStyles: Record<NodeType, React.CSSProperties> = {
  start: {
    background: 'rgba(76, 175, 80, 0.15)',
    border: '1px solid #4CAF50',
    borderRadius: '8px',
    padding: '10px',
    width: '150px',
  },
  end: {
    background: 'rgba(244, 67, 54, 0.15)',
    border: '1px solid #F44336',
    borderRadius: '8px',
    padding: '10px',
    width: '150px',
  },
  persuader: {
    background: 'rgba(33, 150, 243, 0.15)',
    border: '1px solid #2196F3',
    borderRadius: '8px',
    padding: '10px',
    width: '150px',
  },
  collector: {
    background: 'rgba(255, 152, 0, 0.15)',
    border: '1px solid #FF9800',
    borderRadius: '8px',
    padding: '10px',
    width: '150px',
  },
  selector: {
    background: 'rgba(156, 39, 176, 0.15)',
    border: '1px solid #9C27B0',
    borderRadius: '8px',
    padding: '10px',
    width: '150px',
  },
  global_node: {
    background: 'rgba(96, 125, 139, 0.15)',
    border: '1px solid #607D8B',
    borderRadius: '8px',
    padding: '10px',
    width: '150px',
  },
};

const selectedStyle: React.CSSProperties = {
  boxShadow: '0 0 0 2px #1890ff',
};

export const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { label, nodeType } = data;
  const nodeStyle = nodeStyles[nodeType];
  const nodeColor = nodeColors[nodeType] || '#888888';
  
  return (
    <div
      style={{
        padding: '10px',
        borderRadius: '5px',
        backgroundColor: nodeColor,
        color: 'white',
        border: `1px solid ${nodeColor}`,
        fontWeight: 'bold',
        width: '150px',
        boxShadow: selected ? selectedStyle.boxShadow : 'none',
      }}
    >
      {nodeType !== 'start' && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#555' }}
        />
      )}
      <div style={{ 
        textAlign: 'center', 
        fontWeight: 'bold'
      }}>{label}</div>
      <div style={{ 
        textAlign: 'center', 
        fontSize: '12px', 
        marginTop: '4px',
        opacity: 0.9
      }}>
        {nodeType}
      </div>
      {nodeType !== 'end' && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: '#555' }}
        />
      )}
    </div>
  );
};

export default CustomNode; 