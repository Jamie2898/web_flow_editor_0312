import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Typography, 
  List, 
  Button, 
  Card, 
  Modal, 
  Form, 
  Input, 
  Popconfirm, 
  message, 
  Space 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExportOutlined 
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

const { Header, Content } = Layout;
const { Title } = Typography;

// Flow metadata interface
interface FlowMetadata {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const FlowManager: React.FC = () => {
  const navigate = useNavigate();
  const [flows, setFlows] = useState<FlowMetadata[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<FlowMetadata | null>(null);
  const [form] = Form.useForm();
  const [renameForm] = Form.useForm();

  // Load flows from localStorage on component mount
  useEffect(() => {
    const savedFlows = localStorage.getItem('flowMetadata');
    if (savedFlows) {
      setFlows(JSON.parse(savedFlows));
    }
  }, []);

  // Save flows to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('flowMetadata', JSON.stringify(flows));
  }, [flows]);

  // Create a new flow
  const handleCreateFlow = () => {
    form.validateFields().then(values => {
      const newFlow: FlowMetadata = {
        id: uuidv4(),
        name: values.name,
        description: values.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create empty flow data
      const emptyFlowData = {
        nodes: [],
        edges: []
      };
      
      // Save empty flow data to localStorage
      localStorage.setItem(`flow_${newFlow.id}`, JSON.stringify(emptyFlowData));
      
      // Update flows list
      setFlows([...flows, newFlow]);
      
      // Reset form and close modal
      form.resetFields();
      setCreateModalVisible(false);
      
      message.success('流程创建成功');
    });
  };

  // Open flow editor for a specific flow
  const handleOpenFlow = (flow: FlowMetadata) => {
    // Navigate to the flow editor with the flow ID
    navigate(`/editor/${flow.id}`);
  };

  // Delete a flow
  const handleDeleteFlow = (flow: FlowMetadata) => {
    // Remove flow data from localStorage
    localStorage.removeItem(`flow_${flow.id}`);
    
    // Update flows list
    setFlows(flows.filter(f => f.id !== flow.id));
    
    message.success('流程已删除');
  };

  // Open rename modal
  const handleRenameClick = (flow: FlowMetadata) => {
    setSelectedFlow(flow);
    renameForm.setFieldsValue({
      name: flow.name,
      description: flow.description
    });
    setRenameModalVisible(true);
  };

  // Rename a flow
  const handleRenameFlow = () => {
    if (!selectedFlow) return;
    
    renameForm.validateFields().then(values => {
      // Update flow metadata
      const updatedFlows = flows.map(flow => {
        if (flow.id === selectedFlow.id) {
          return {
            ...flow,
            name: values.name,
            description: values.description || '',
            updatedAt: new Date().toISOString()
          };
        }
        return flow;
      });
      
      setFlows(updatedFlows);
      setRenameModalVisible(false);
      message.success('流程已更新');
    });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
        <Title level={3} style={{ margin: '16px 0' }}>流程图管理</Title>
      </Header>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px', textAlign: 'right' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setCreateModalVisible(true)}
          >
            创建新流程
          </Button>
        </div>
        
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={flows}
          renderItem={flow => (
            <List.Item>
              <Card
                title={flow.name}
                extra={
                  <Space>
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      onClick={() => handleRenameClick(flow)}
                    />
                    <Popconfirm
                      title="确定要删除这个流程吗？"
                      onConfirm={() => handleDeleteFlow(flow)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                      />
                    </Popconfirm>
                  </Space>
                }
                actions={[
                  <Button 
                    type="link" 
                    onClick={() => handleOpenFlow(flow)}
                  >
                    打开编辑器
                  </Button>
                ]}
              >
                <p>{flow.description || '无描述'}</p>
                <p>创建时间: {new Date(flow.createdAt).toLocaleString()}</p>
                <p>更新时间: {new Date(flow.updatedAt).toLocaleString()}</p>
              </Card>
            </List.Item>
          )}
        />
        
        {/* Create Flow Modal */}
        <Modal
          title="创建新流程"
          open={createModalVisible}
          onOk={handleCreateFlow}
          onCancel={() => setCreateModalVisible(false)}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="流程名称"
              rules={[{ required: true, message: '请输入流程名称' }]}
            >
              <Input placeholder="请输入流程名称" />
            </Form.Item>
            <Form.Item
              name="description"
              label="流程描述"
            >
              <Input.TextArea placeholder="请输入流程描述" rows={4} />
            </Form.Item>
          </Form>
        </Modal>
        
        {/* Rename Flow Modal */}
        <Modal
          title="重命名流程"
          open={renameModalVisible}
          onOk={handleRenameFlow}
          onCancel={() => setRenameModalVisible(false)}
        >
          <Form form={renameForm} layout="vertical">
            <Form.Item
              name="name"
              label="流程名称"
              rules={[{ required: true, message: '请输入流程名称' }]}
            >
              <Input placeholder="请输入流程名称" />
            </Form.Item>
            <Form.Item
              name="description"
              label="流程描述"
            >
              <Input.TextArea placeholder="请输入流程描述" rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default FlowManager; 