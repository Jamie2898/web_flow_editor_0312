// Node Types
export type NodeType = 'start' | 'end' | 'persuader' | 'collector' | 'selector' | 'global_node';

// Router Condition Types
export type ConditionType = 'semantic' | 'parameter' | 'force';

// Router Interface
export interface Router {
  next_node: string;
  condition_type: ConditionType;
  condition?: string | object;
}

// Slot Info Interface
export interface SlotInfo {
  name: string;
  type: string;
  description: string;
}

// Strategy Interface
export interface Strategy {
  situation: string;
  scripts: string[];
}

// Pre-Action Interface
export interface PreAction {
  type: string;
  config: {
    name: string;
    [key: string]: any;
  };
}

// Max Turn Action Interface
export interface MaxTurnAction {
  action: string;
  next_node: string;
}

// Base Node Interface
export interface BaseNode {
  id: string;
  type: NodeType;
  max_turn?: number;
  config: {
    goal?: string;
    max_turn?: number;
    max_turn_action?: MaxTurnAction;
    slot_infos?: SlotInfo[];
    strategies?: Strategy[];
    first_script?: string;
    scripts?: string[];
    routers: Router[];
    node_selection_system_prompt?: string;
    node_selection_user_prompt?: string;
    node_selection_examples?: any;
    node_answer_system_prompt?: string;
    node_answer_user_prompt?: string;
    pre_actions?: PreAction[];
  };
}

// Global Node Interface
export interface GlobalNode {
  id: string;
  type: 'global_node';
  condition: string | object;
  strategies?: Strategy[];
  pre_actions?: PreAction[] | object;
  routers?: Router[];
  turn?: number;
  node_answer_system_prompt?: string;
  node_answer_user_prompt?: string;
}

// Task Graph Configuration
export interface TaskGraphConfig {
  global_nodes: GlobalNode[];
  nodes: BaseNode[];
}

// React Flow Node Types
export interface ReactFlowNodeData {
  label: string;
  nodeType: NodeType;
  nodeData: BaseNode | GlobalNode;
}

// Custom Edge Data
export interface EdgeData {
  sourceNode: string;
  targetNode: string;
  conditionType: ConditionType;
  condition?: string | object;
} 