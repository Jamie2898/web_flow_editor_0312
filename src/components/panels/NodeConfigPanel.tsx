import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Space, Collapse, Card, Typography, message, Modal } from 'antd';
import { PlusOutlined, MinusCircleOutlined, SaveOutlined, ExpandOutlined } from '@ant-design/icons';
import { BaseNode, GlobalNode, NodeType, Router, Strategy, SlotInfo, PreAction } from '../../types';

const { Panel } = Collapse;
const { TextArea } = Input;
const { Title } = Typography;

// Define proper interface for the PromptEditorModal props
interface PromptEditorModalProps {
  visible: boolean;
  title: string;
  value: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onOk: () => void;
}

// Add a new component for the prompt editor modal with proper types
const PromptEditorModal: React.FC<PromptEditorModalProps> = ({ 
  visible, 
  title, 
  value, 
  onChange, 
  onCancel, 
  onOk 
}) => {
  const [localValue, setLocalValue] = useState<string>(value || '');

  // Update local value when the input value changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleOk = () => {
    onChange(localValue);
    onOk();
  };

  return (
    <Modal
      title={`Edit ${title}`}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      width={800}
      bodyStyle={{ padding: '12px' }}
      destroyOnClose
    >
      <TextArea
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        autoSize={{ minRows: 20, maxRows: 30 }}
        style={{ fontFamily: 'monospace' }}
      />
    </Modal>
  );
};

// Define proper interface for the PromptFormItem props
interface PromptFormItemProps {
  name: string;
  label: string;
  form: any; // Ideally, this should be FormInstance<any> but we'll keep it simple
}

// Add this to the existing TextArea form items in the NodeConfigPanel component
const PromptFormItem: React.FC<PromptFormItemProps> = ({ name, label, form }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const value = Form.useWatch(name, form);

  return (
    <>
      <Form.Item
        name={name}
        label={
          <Space>
            {label}
            <Button
              type="text"
              icon={<ExpandOutlined />}
              onClick={() => setModalVisible(true)}
              size="small"
              title="Open in larger editor"
            />
          </Space>
        }
      >
        <TextArea autoSize={{ minRows: 3, maxRows: 6 }} />
      </Form.Item>

      <PromptEditorModal
        visible={modalVisible}
        title={label}
        value={value || ''}
        onChange={(newValue: string) => form.setFieldValue(name, newValue)}
        onCancel={() => setModalVisible(false)}
        onOk={() => setModalVisible(false)}
      />
    </>
  );
};

interface NodeConfigPanelProps {
  node: BaseNode | GlobalNode | null;
  onNodeUpdate: (updatedNode: BaseNode | GlobalNode) => void;
}

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ node, onNodeUpdate }) => {
  const [form] = Form.useForm();
  const [activeKey, setActiveKey] = useState<string | string[]>(['basic']);
  // Add a state to track if there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Reset form when node changes
  useEffect(() => {
    if (node) {
      form.setFieldsValue(getInitialValues(node));
      setHasUnsavedChanges(false);
    }
  }, [node, form]);

  if (!node) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Title level={4}>Select a node to configure</Title>
      </div>
    );
  }

  // Modified to only track changes without updating the node
  const handleFormChange = () => {
    setHasUnsavedChanges(true);
  };

  // New function to handle saving changes
  const handleSaveChanges = () => {
    const allValues = form.getFieldsValue();
    
    if (node) {
      const updatedNode = { ...node };
      
      // Handle different node types
      if (node.type === 'global_node') {
        Object.assign(updatedNode, allValues);
      } else {
        // For regular nodes
        updatedNode.id = allValues.id;
        updatedNode.type = allValues.type;
        
        if ('max_turn' in updatedNode) {
          updatedNode.max_turn = allValues.max_turn;
        }
        
        // Update config properties
        if ('config' in updatedNode) {
          updatedNode.config = {
            ...updatedNode.config,
            goal: allValues.goal,
            max_turn: allValues.config_max_turn,
            first_script: allValues.first_script,
            scripts: allValues.scripts,
            routers: allValues.routers || [],
            strategies: allValues.strategies || [],
            slot_infos: allValues.slot_infos || [],
            pre_actions: allValues.pre_actions || [],
            node_selection_system_prompt: allValues.node_selection_system_prompt,
            node_selection_user_prompt: allValues.node_selection_user_prompt,
            node_answer_system_prompt: allValues.node_answer_system_prompt,
            node_answer_user_prompt: allValues.node_answer_user_prompt,
          };
          
          // Handle max_turn_action if it exists
          if (allValues.max_turn_action_action && allValues.max_turn_action_next_node) {
            updatedNode.config.max_turn_action = {
              action: allValues.max_turn_action_action,
              next_node: allValues.max_turn_action_next_node,
            };
          }
        }
      }
      
      onNodeUpdate(updatedNode);
      setHasUnsavedChanges(false);
      message.success('Node configuration saved successfully');
    }
  };

  // Helper function to get initial values
  const getInitialValues = (node: BaseNode | GlobalNode) => {
    if (node.type === 'global_node') {
      return { ...node };
    }
    
    return {
      id: node.id,
      type: node.type,
      max_turn: 'max_turn' in node ? node.max_turn || -1 : -1,
      goal: node.config.goal || '',
      config_max_turn: node.config.max_turn || -1,
      first_script: node.config.first_script || '',
      scripts: node.config.scripts || [],
      routers: node.config.routers || [],
      strategies: node.config.strategies || [],
      slot_infos: node.config.slot_infos || [],
      pre_actions: node.config.pre_actions || [],
      max_turn_action_action: node.config.max_turn_action?.action || '',
      max_turn_action_next_node: node.config.max_turn_action?.next_node || '',
      node_selection_system_prompt: node.config.node_selection_system_prompt || '',
      node_selection_user_prompt: node.config.node_selection_user_prompt || '',
      node_answer_system_prompt: node.config.node_answer_system_prompt || '',
      node_answer_user_prompt: node.config.node_answer_user_prompt || '',
    };
  };

  const initialValues = getInitialValues(node);

  const renderBasicConfig = () => (
    <Panel header="Basic Configuration" key="basic">
      <Form.Item name="id" label="ID" rules={[{ required: true }]}>
        <Input disabled />
      </Form.Item>
      
      <Form.Item name="type" label="Type" rules={[{ required: true }]}>
        <Input disabled />
      </Form.Item>
      
      <Form.Item name="config_max_turn" label="Config Max Turn" initialValue={-1}>
        <Input type="number" placeholder="Default: -1 (unlimited)" />
      </Form.Item>
      
      {node.type !== 'global_node' && node.type !== 'start' && node.type !== 'end' && (
        <Form.Item name="goal" label="Goal">
          <TextArea rows={4} placeholder="Enter the goal of this node" />
        </Form.Item>
      )}
      
      {node.type === 'global_node' && (
        <Form.Item name="condition" label="Condition" rules={[{ required: true }]}>
          <TextArea rows={4} placeholder="Enter condition (string or JSON object)" />
        </Form.Item>
      )}
    </Panel>
  );

  const renderScriptsConfig = () => (
    <Panel header="Scripts Configuration [请勿使用]" key="scripts">
      {node.type !== 'global_node' && (
        <Form.Item name="first_script" label="First Script">
          <TextArea rows={4} placeholder="Enter first script" />
        </Form.Item>
      )}
      
      <Form.List name="scripts">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={name}
                  rules={[{ required: true, message: 'Please input script' }]}
                >
                  <TextArea rows={4} placeholder="Enter script" />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add Script
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Panel>
  );

  const renderRoutersConfig = () => (
    <Panel header="Routers Configuration" key="routers">
      <Form.List name="routers">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card key={key} style={{ marginBottom: 16 }} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'next_node']}
                    label="Next Node"
                    rules={[{ required: true, message: 'Please input next node ID' }]}
                  >
                    <Input placeholder="Enter next node ID" />
                  </Form.Item>
                  
                  <Form.Item
                    {...restField}
                    name={[name, 'condition_type']}
                    label="Condition Type"
                    rules={[{ required: true, message: 'Please select condition type' }]}
                  >
                    <Select placeholder="Select condition type">
                      <Select.Option value="semantic">Semantic</Select.Option>
                      <Select.Option value="parameter">Parameter</Select.Option>
                      <Select.Option value="force">Force</Select.Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    {...restField}
                    name={[name, 'condition']}
                    label="Condition"
                  >
                    <TextArea rows={4} placeholder="Enter condition (string or JSON object)" />
                  </Form.Item>
                  
                  <Button type="text" danger onClick={() => remove(name)} icon={<MinusCircleOutlined />}>
                    Remove Router
                  </Button>
                </Space>
              </Card>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add Router
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Panel>
  );

  const renderStrategiesConfig = () => (
    <Panel header="Strategies Configuration" key="strategies">
      <Form.List name="strategies">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card key={key} style={{ marginBottom: 16 }} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'situation']}
                    label="Situation"
                    rules={[{ required: true, message: 'Please input situation' }]}
                  >
                    <Input placeholder="Enter situation" />
                  </Form.Item>
                  
                  <Form.List name={[name, 'scripts']}>
                    {(scriptFields, { add: addScript, remove: removeScript }) => (
                      <>
                        {scriptFields.map(({ key: scriptKey, name: scriptName, ...scriptRestField }) => (
                          <Space key={scriptKey} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                            <Form.Item
                              {...scriptRestField}
                              name={scriptName}
                              rules={[{ required: true, message: 'Please input script' }]}
                            >
                              <TextArea rows={4} placeholder="Enter script" />
                            </Form.Item>
                            <MinusCircleOutlined onClick={() => removeScript(scriptName)} />
                          </Space>
                        ))}
                        <Form.Item>
                          <Button type="dashed" onClick={() => addScript()} block icon={<PlusOutlined />}>
                            Add Script
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                  
                  <Button type="text" danger onClick={() => remove(name)} icon={<MinusCircleOutlined />}>
                    Remove Strategy
                  </Button>
                </Space>
              </Card>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add Strategy
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Panel>
  );

  const renderSlotInfosConfig = () => (
    <Panel header="Slot Infos Configuration" key="slot_infos">
      <Form.List name="slot_infos">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card key={key} style={{ marginBottom: 16 }} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'name']}
                    label="Name"
                    rules={[{ required: true, message: 'Please input name' }]}
                  >
                    <Input placeholder="Enter name" />
                  </Form.Item>
                  
                  <Form.Item
                    {...restField}
                    name={[name, 'type']}
                    label="Type"
                    rules={[{ required: true, message: 'Please input type' }]}
                  >
                    <Input placeholder="Enter type" />
                  </Form.Item>
                  
                  <Form.Item
                    {...restField}
                    name={[name, 'description']}
                    label="Description"
                    rules={[{ required: true, message: 'Please input description' }]}
                  >
                    <Input placeholder="Enter description" />
                  </Form.Item>
                  
                  <Button type="text" danger onClick={() => remove(name)} icon={<MinusCircleOutlined />}>
                    Remove Slot Info
                  </Button>
                </Space>
              </Card>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add Slot Info
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Panel>
  );

  const renderPreActionsConfig = () => (
    <Panel header="Pre Actions Configuration" key="pre_actions">
      <Form.List name="pre_actions">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card key={key} style={{ marginBottom: 16 }} size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'type']}
                    label="Type"
                    rules={[{ required: true, message: 'Please input type' }]}
                  >
                    <Input placeholder="Enter type" />
                  </Form.Item>
                  
                  <Form.Item
                    {...restField}
                    name={[name, 'config', 'name']}
                    label="Config Name"
                    rules={[{ required: true, message: 'Please input config name' }]}
                  >
                    <Input placeholder="Enter config name" />
                  </Form.Item>
                  
                  <Button type="text" danger onClick={() => remove(name)} icon={<MinusCircleOutlined />}>
                    Remove Pre Action
                  </Button>
                </Space>
              </Card>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add Pre Action
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Panel>
  );

  const renderPromptsConfig = () => (
    <Panel header="Prompt Configuration" key="prompts">
      {node.type !== 'global_node' && (
        <>
          <PromptFormItem 
            name="node_selection_system_prompt" 
            label="Node Selection System Prompt" 
            form={form} 
          />
          <PromptFormItem 
            name="node_selection_user_prompt" 
            label="Node Selection User Prompt" 
            form={form} 
          />
        </>
      )}
      <PromptFormItem 
        name="node_answer_system_prompt" 
        label="Node Answer System Prompt" 
        form={form} 
      />
      <PromptFormItem 
        name="node_answer_user_prompt" 
        label="Node Answer User Prompt" 
        form={form} 
      />
    </Panel>
  );

  const renderMaxTurnActionConfig = () => (
    <Panel header="Max Turn Action Configuration" key="max_turn_action">
      <Form.Item name="max_turn_action_action" label="Action">
        <Input placeholder="Enter action (e.g., 'jump')" />
      </Form.Item>
      
      <Form.Item name="max_turn_action_next_node" label="Next Node">
        <Input placeholder="Enter next node ID" />
      </Form.Item>
    </Panel>
  );

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      <Title level={4}>Configure {node.type} Node: {node.id}</Title>
      
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          onClick={handleSaveChanges}
          disabled={!hasUnsavedChanges}
        >
          Save Changes
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={handleFormChange}
      >
        <Collapse
          activeKey={activeKey}
          onChange={setActiveKey}
        >
          {renderBasicConfig()}
          {renderScriptsConfig()}
          {renderRoutersConfig()}
          {renderStrategiesConfig()}
          {node.type !== 'global_node' && node.type !== 'start' && node.type !== 'end' && renderSlotInfosConfig()}
          {renderPreActionsConfig()}
          {renderPromptsConfig()}
          {node.type !== 'global_node' && renderMaxTurnActionConfig()}
        </Collapse>
      </Form>
    </div>
  );
};

export default NodeConfigPanel; 