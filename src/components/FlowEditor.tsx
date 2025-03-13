import React, { useState, useCallback, useRef, DragEvent, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Layout, Button, Drawer, Tabs, Modal, Form, Input, Select, message, Card, Typography, notification, Menu, Dropdown } from 'antd';
import { PlusOutlined, RightOutlined, LeftOutlined, DownOutlined, ClearOutlined, SaveOutlined, UploadOutlined, FileOutlined, EyeOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

import { BaseNode, GlobalNode, NodeType, TaskGraphConfig, ReactFlowNodeData, Router, EdgeData } from '../types';
import CustomNode from './nodes/NodeTypes';
import NodeConfigPanel from './panels/NodeConfigPanel';
import JsonPreviewPanel from './panels/JsonPreviewPanel';

const { Content, Sider } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

// Define node types for React Flow
const nodeTypes: NodeTypes = {
  customNode: CustomNode,
};

// Default node data for each node type
const defaultNodeData: Record<NodeType, Partial<BaseNode | GlobalNode>> = {
  start: {
    type: 'start',
    max_turn: -1,
    config: {
      routers: [
        {
          next_node: '',
          condition_type: 'force',
        },
      ],
    },
  },
  end: {
    type: 'end',
    max_turn: -1,
    config: {
      routers: [],
    },
  },
  persuader: {
    type: 'persuader',
    max_turn: -1,
    config: {
      goal: '',
      max_turn: -1,
      scripts: [],
      routers: [],
    },
  },
  collector: {
    type: 'collector',
    max_turn: -1,
    config: {
      goal: '',
      max_turn: -1,
      scripts: [],
      routers: [],
      slot_infos: [],
    },
  },
  selector: {
    type: 'selector',
    max_turn: -1,
    config: {
      goal: '',
      max_turn: -1,
      scripts: [],
      routers: [],
    },
  },
  global_node: {
    type: 'global_node',
    condition: '',
    strategies: [],
    routers: [],
  },
};

// Node type display information with colors
const nodeTypeInfo = {
  start: { 
    title: 'Start', 
    description: 'Entry point of the flow',
    color: '#4CAF50'  // Green for start nodes
  },
  end: { 
    title: 'End', 
    description: 'Exit point of the flow',
    color: '#F44336'  // Red for end nodes
  },
  persuader: { 
    title: 'Persuader', 
    description: 'Persuade users to take action',
    color: '#2196F3'  // Blue for persuader nodes
  },
  collector: { 
    title: 'Collector', 
    description: 'Collect information from users',
    color: '#FF9800'  // Orange for collector nodes
  },
  selector: { 
    title: 'Selector', 
    description: 'Select between different paths',
    color: '#9C27B0'  // Purple for selector nodes
  },
  global_node: { 
    title: 'Global Node', 
    description: 'Apply globally across the flow',
    color: '#607D8B'  // Blue-grey for global nodes
  },
};

const FlowEditor: React.FC = () => {
  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Selected node state
  const [selectedNode, setSelectedNode] = useState<BaseNode | GlobalNode | null>(null);
  
  // Drawer states
  const [configDrawerVisible, setConfigDrawerVisible] = useState(false);
  const [jsonDrawerVisible, setJsonDrawerVisible] = useState(false);
  
  // Modal states
  const [addNodeModalVisible, setAddNodeModalVisible] = useState(false);
  const [addNodeForm] = Form.useForm();
  
  // Ref for the ReactFlow instance
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Generate task graph config
  const generateTaskGraphConfig = useCallback((): TaskGraphConfig => {
    const regularNodes: BaseNode[] = [];
    const globalNodes: GlobalNode[] = [];
    
    nodes.forEach((node) => {
      const nodeData = node.data.nodeData;
      
      if (nodeData.type === 'global_node') {
        // For global nodes, create a new object with id first and without type
        const { type, ...nodeWithoutType } = nodeData;
        const reorderedNode = {
          id: nodeData.id,
          ...nodeWithoutType
        };
        globalNodes.push(reorderedNode as GlobalNode);
      } else {
        // For regular nodes, create a new object with id first
        const reorderedNode = {
          id: nodeData.id,
          ...nodeData
        };
        regularNodes.push(reorderedNode as BaseNode);
      }
    });
    
    return {
      global_nodes: globalNodes,
      nodes: regularNodes,
    };
  }, [nodes]);

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const nodeData = node.data.nodeData;
    setSelectedNode(nodeData);
    setConfigDrawerVisible(true);
  }, []);

  // Handle node update from config panel
  const handleNodeUpdate = useCallback((updatedNode: BaseNode | GlobalNode) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode?.id) {
          // Update the node ID in the React Flow node object
          return {
            ...node,
            id: updatedNode.id, // Update the node ID to match the updated node data
            data: {
              ...node.data,
              label: updatedNode.id, // Update the label to match the new ID
              nodeData: updatedNode,
            },
          };
        }
        return node;
      })
    );
    
    // Update edges to reflect the ID change if it was changed
    if (selectedNode && selectedNode.id !== updatedNode.id) {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.source === selectedNode.id) {
            return {
              ...edge,
              source: updatedNode.id,
              data: {
                ...edge.data,
                sourceNode: updatedNode.id,
              },
            };
          }
          if (edge.target === selectedNode.id) {
            return {
              ...edge,
              target: updatedNode.id,
              data: {
                ...edge.data,
                targetNode: updatedNode.id,
              },
            };
          }
          return edge;
        })
      );
      
      // Also update routers in other nodes that reference this node
      setNodes((nds) =>
        nds.map((node) => {
          const nodeData = node.data.nodeData;
          let updated = false;
          
          // Update references in routers
          if (nodeData.type === 'global_node') {
            if (nodeData.routers) {
              nodeData.routers = nodeData.routers.map((router: Router) => {
                if (router.next_node === selectedNode.id) {
                  updated = true;
                  return { ...router, next_node: updatedNode.id };
                }
                return router;
              });
            }
          } else {
            nodeData.config.routers = nodeData.config.routers.map((router: Router) => {
              if (router.next_node === selectedNode.id) {
                updated = true;
                return { ...router, next_node: updatedNode.id };
              }
              return router;
            });
          }
          
          // Only create a new object if something was updated
          if (updated) {
            return {
              ...node,
              data: {
                ...node.data,
                nodeData,
              },
            };
          }
          return node;
        })
      );
    }
    
    // Update the selected node reference
    setSelectedNode(updatedNode);
  }, [selectedNode, setNodes, setEdges]);

  // Handle edge connection
  const onConnect = useCallback(
    (connection: Connection) => {
      // Find source and target nodes
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);
      
      if (!sourceNode || !targetNode) return;
      
      // Create a new edge with a unique ID
      const newEdge: Edge<EdgeData> = {
        id: `e${connection.source}-${connection.target}`,
        source: connection.source || '',
        target: connection.target || '',
        type: 'default',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        data: {
          sourceNode: sourceNode.data.nodeData.id,
          targetNode: targetNode.data.nodeData.id,
          conditionType: 'force',
        },
      };
      
      // Check if this edge already exists to prevent duplicates
      const edgeExists = edges.some(
        (edge) => edge.source === connection.source && edge.target === connection.target
      );
      
      if (edgeExists) {
        // If the edge already exists, don't add it again
        return;
      }
      
      // Add the edge to the graph
      setEdges((eds) => addEdge(newEdge, eds));
      
      // Update the source node's routers
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === connection.source) {
            const nodeData = node.data.nodeData;
            const targetNodeId = targetNode.data.nodeData.id;
            
            // Create a new router
            const newRouter: Router = {
              next_node: targetNodeId,
              condition_type: 'force',
            };
            
            // Check if this router already exists to prevent duplicates
            let routerExists = false;
            
            if (nodeData.type === 'global_node') {
              routerExists = nodeData.routers?.some(
                (router: Router) => router.next_node === targetNodeId
              ) || false;
              
              // Only add the router if it doesn't already exist
              if (!routerExists) {
                if (!nodeData.routers) {
                  nodeData.routers = [];
                }
                nodeData.routers.push(newRouter);
              }
            } else {
              routerExists = nodeData.config.routers.some(
                (router: Router) => router.next_node === targetNodeId
              );
              
              // Only add the router if it doesn't already exist
              if (!routerExists) {
                nodeData.config.routers.push(newRouter);
              }
            }
            
            return {
              ...node,
              data: {
                ...node.data,
                nodeData,
              },
            };
          }
          return node;
        })
      );
    },
    [nodes, edges, setEdges, setNodes]
  );

  // Handle node deletion
  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      // Close the config drawer if the selected node is deleted
      if (selectedNode && deletedNodes.some((n) => n.id === selectedNode.id)) {
        setConfigDrawerVisible(false);
        setSelectedNode(null);
      }
      
      // Remove any edges connected to the deleted nodes
      const deletedNodeIds = deletedNodes.map((n) => n.id);
      setEdges((eds) => eds.filter((e) => !deletedNodeIds.includes(e.source) && !deletedNodeIds.includes(e.target)));
      
      // Update routers in remaining nodes
      setNodes((nds) =>
        nds.map((node) => {
          const nodeData = node.data.nodeData;
          
          if (nodeData.type === 'global_node') {
            if (nodeData.routers) {
              nodeData.routers = nodeData.routers.filter(
                (router: Router) => !deletedNodeIds.includes(router.next_node)
              );
            }
          } else {
            nodeData.config.routers = nodeData.config.routers.filter(
              (router: Router) => !deletedNodeIds.includes(router.next_node)
            );
          }
          
          return {
            ...node,
            data: {
              ...node.data,
              nodeData,
            },
          };
        })
      );
    },
    [selectedNode, setConfigDrawerVisible, setEdges, setNodes]
  );

  // Handle edge deletion
  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      // Update routers in nodes
      setNodes((nds) =>
        nds.map((node) => {
          const nodeData = node.data.nodeData;
          
          deletedEdges.forEach((edge) => {
            if (edge.source === node.id) {
              if (nodeData.type === 'global_node') {
                if (nodeData.routers) {
                  nodeData.routers = nodeData.routers.filter(
                    (router: Router) => router.next_node !== edge.target
                  );
                }
              } else {
                nodeData.config.routers = nodeData.config.routers.filter(
                  (router: Router) => router.next_node !== edge.target
                );
              }
            }
          });
          
          return {
            ...node,
            data: {
              ...node.data,
              nodeData,
            },
          };
        })
      );
    },
    [setNodes]
  );

  // Handle adding a new node
  const handleAddNode = useCallback(() => {
    addNodeForm.validateFields().then((values) => {
      const { nodeType, nodeId } = values;
      
      // Check if the node ID already exists
      const nodeExists = nodes.some((n) => n.data.nodeData.id === nodeId);
      if (nodeExists) {
        message.error('Node ID already exists. Please use a unique ID.');
        return;
      }
      
      // Create a new node
      const newNodeData = {
        ...defaultNodeData[nodeType as NodeType],
        id: nodeId,
      } as BaseNode | GlobalNode;
      
      // Get the position for the new node
      const position = reactFlowInstance?.project({
        x: Math.random() * 400,
        y: Math.random() * 400,
      }) || { x: 100, y: 100 };
      
      // Create the React Flow node
      const newNode: Node<ReactFlowNodeData> = {
        id: nodeId,
        type: 'customNode',
        position,
        data: {
          label: nodeId,
          nodeType: nodeType as NodeType,
          nodeData: newNodeData,
        },
      };
      
      // Add the node to the graph
      setNodes((nds) => [...nds, newNode]);
      
      // Reset the form and close the modal
      addNodeForm.resetFields();
      setAddNodeModalVisible(false);
    });
  }, [addNodeForm, nodes, reactFlowInstance, setNodes]);

  // Handle node drag start
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Handle node drop
  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const nodeType = event.dataTransfer.getData('application/reactflow') as NodeType;
      
      if (!reactFlowBounds || !nodeType || !reactFlowInstance) {
        return;
      }

      // Generate a unique ID for the new node
      const nodeId = `${nodeType}_${uuidv4().substring(0, 8)}`;
      
      // Calculate position where the node was dropped
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create the new node data
      const newNodeData = {
        ...defaultNodeData[nodeType],
        id: nodeId,
      } as BaseNode | GlobalNode;
      
      // Create the React Flow node
      const newNode: Node<ReactFlowNodeData> = {
        id: nodeId,
        type: 'customNode',
        position,
        data: {
          label: nodeId,
          nodeType: nodeType,
          nodeData: newNodeData,
        },
      };
      
      // Add the node to the graph
      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes]
  );

  // Handle drag over
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Save the current flow to localStorage
  const saveFlow = useCallback(() => {
    if (nodes.length === 0) {
      notification.warning({
        message: 'Nothing to save',
        description: 'The flow graph is empty. Please add some nodes before saving.',
      });
      return;
    }

    const flow = {
      nodes,
      edges,
      lastSaved: new Date().toISOString(),
    };
    
    try {
      localStorage.setItem('flowEditorState', JSON.stringify(flow));
      notification.success({
        message: 'Flow saved successfully',
        description: 'Your flow graph has been saved to the browser storage.',
      });
    } catch (error) {
      notification.error({
        message: 'Failed to save flow',
        description: 'An error occurred while saving your flow graph.',
      });
      console.error('Error saving flow:', error);
    }
  }, [nodes, edges]);

  // Load the flow from localStorage
  const loadFlow = useCallback(() => {
    try {
      const savedFlow = localStorage.getItem('flowEditorState');
      
      if (savedFlow) {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedFlow);
        setNodes(savedNodes);
        setEdges(savedEdges);
        notification.success({
          message: 'Flow loaded successfully',
          description: 'Your saved flow graph has been loaded.',
        });
      } else {
        notification.info({
          message: 'No saved flow found',
          description: 'No previously saved flow graph was found.',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Failed to load flow',
        description: 'An error occurred while loading your saved flow graph.',
      });
      console.error('Error loading flow:', error);
    }
  }, [setNodes, setEdges]);

  // Auto-load saved flow on component mount
  useEffect(() => {
    const savedFlow = localStorage.getItem('flowEditorState');
    if (savedFlow) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedFlow);
        setNodes(savedNodes);
        setEdges(savedEdges);
      } catch (error) {
        console.error('Error auto-loading flow:', error);
      }
    }
  }, [setNodes, setEdges]);

  // Export flow to a file
  const exportFlow = useCallback(() => {
    if (nodes.length === 0) {
      notification.warning({
        message: 'Nothing to export',
        description: 'The flow graph is empty. Please add some nodes before exporting.',
      });
      return;
    }

    const flow = {
      nodes,
      edges,
      lastSaved: new Date().toISOString(),
    };
    
    const flowJson = JSON.stringify(flow, null, 2);
    const blob = new Blob([flowJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `flow-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    notification.success({
      message: 'Flow exported successfully',
      description: 'Your flow graph has been exported to a file.',
    });
  }, [nodes, edges]);

  // Import flow from a file
  const importFlow = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const { nodes: importedNodes, edges: importedEdges } = JSON.parse(content);
          
          setNodes(importedNodes);
          setEdges(importedEdges);
          
          notification.success({
            message: 'Flow imported successfully',
            description: 'Your flow graph has been imported from the file.',
          });
        } catch (error) {
          notification.error({
            message: 'Failed to import flow',
            description: 'The selected file contains invalid data.',
          });
          console.error('Error importing flow:', error);
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }, [setNodes, setEdges]);

  // Add clear flow function
  const clearFlow = useCallback(() => {
    if (nodes.length > 0) {
      Modal.confirm({
        title: '清除流程图',
        content: '确定要清除当前流程图吗？未保存的更改将会丢失。',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          setNodes([]);
          setEdges([]);
          notification.success({
            message: '流程已清除',
            description: '您可以开始创建新的流程图了。',
          });
        },
      });
    } else {
      notification.info({
        message: '流程已清空',
        description: '当前没有节点可清除。',
      });
    }
  }, [nodes.length, setNodes, setEdges]);

  const flowActionsMenu = (
    <Menu>
      <Menu.Item key="new" icon={<ClearOutlined />} onClick={clearFlow}>
        新建流程
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="save" icon={<SaveOutlined />} onClick={saveFlow}>
        保存流程
      </Menu.Item>
      <Menu.Item key="load" icon={<UploadOutlined />} onClick={loadFlow}>
        加载流程
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="export" icon={<FileOutlined />} onClick={exportFlow}>
        导出到文件
      </Menu.Item>
      <Menu.Item key="import" icon={<UploadOutlined />} onClick={importFlow}>
        从文件导入
      </Menu.Item>
    </Menu>
  );

  return (
    <ReactFlowProvider>
      <Layout style={{ height: '100%', overflow: 'hidden' }}>
        {/* Node Types Sidebar */}
        <Sider 
          width={250}
          theme="light"
          style={{ 
            borderRight: '1px solid #f0f0f0',
            height: '100%',
            overflow: 'auto'
          }}
        >
          <div style={{ padding: '16px' }}>
            <Title level={4} style={{ marginBottom: '16px' }}>Node Types</Title>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px'
            }}>
              {Object.entries(nodeTypeInfo).map(([type, info]) => (
                <div
                  key={type}
                  style={{ 
                    padding: '10px',
                    borderRadius: '5px',
                    backgroundColor: info.color,
                    color: 'white',
                    cursor: 'grab',
                    marginBottom: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                  draggable
                  onDragStart={(event) => onDragStart(event, type as NodeType)}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{info.title}</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>{info.description}</div>
                </div>
              ))}
            </div>
          </div>
        </Sider>
        
        <Content style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
          <div 
            ref={reactFlowWrapper} 
            style={{ width: '100%', height: '100%' }}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodesDelete={onNodesDelete}
              onEdgesDelete={onEdgesDelete}
              onNodeClick={onNodeClick}
              onInit={setReactFlowInstance}
              nodeTypes={nodeTypes}
              fitView
              style={{ width: '100%', height: '100%' }}
            >
              <Controls />
              <Background />
            </ReactFlow>
          </div>
          
          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
            <Dropdown overlay={flowActionsMenu}>
              <Button>
                流程操作 <DownOutlined />
              </Button>
            </Dropdown>
            <Button
              onClick={() => setJsonDrawerVisible(true)}
              style={{ marginLeft: 8 }}
              icon={<EyeOutlined />}
            >
              预览JSON
            </Button>
          </div>
        </Content>
        
        {/* Node Configuration Drawer */}
        <Drawer
          title="Node Configuration"
          placement="right"
          width={500}
          onClose={() => setConfigDrawerVisible(false)}
          open={configDrawerVisible}
          destroyOnClose
        >
          <NodeConfigPanel
            node={selectedNode}
            onNodeUpdate={handleNodeUpdate}
          />
        </Drawer>
        
        {/* JSON Preview Drawer */}
        <Drawer
          title="JSON Preview"
          placement="right"
          width={600}
          onClose={() => setJsonDrawerVisible(false)}
          open={jsonDrawerVisible}
          destroyOnClose
        >
          <JsonPreviewPanel taskGraph={generateTaskGraphConfig()} />
        </Drawer>
      </Layout>
    </ReactFlowProvider>
  );
};

export default FlowEditor; 