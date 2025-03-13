# Web Flow Editor

A visual editor for designing and configuring task graphs used in LLM-based conversational systems. This tool allows you to create, edit, and manage task nodes and their relationships, ultimately generating a standardized `config.json` file for conversational AI workflows.

## Features

- **Interactive Visual Editor**: Create, connect, and manage different types of nodes in a drag-and-drop interface
- **Comprehensive Node Configuration**: Configure each node's parameters through an intuitive panel interface
- **Advanced Routing Logic**: Define complex conversation flows with various condition types
- **JSON Export/Import**: Generate, preview, and download the final configuration file
- **Responsive Layout**: Adaptive design with collapsible panels for better workspace management

## Node Types

1. **Start Node**: Entry point for the conversation flow
2. **End Node**: Termination point for the conversation flow
3. **Persuader Node**: Used for guiding users through persuasive dialogue
4. **Collector Node**: Used for collecting information from users
5. **Selector Node**: Used for making decisions based on user input
6. **Global Node**: Special nodes that handle global conditions and exceptions

## Project Structure

### Main Files and Directories

- **`src/`**: Contains all source code for the application
  - **`types/index.ts`**: TypeScript interfaces defining all data structures
  - **`components/`**: React components
    - **`FlowEditor.tsx`**: Core component managing the graph editor functionality
    - **`FlowManager.tsx`**: Handles flow management operations
    - **`nodes/NodeTypes.tsx`**: Custom node components for React Flow visualization
    - **`panels/NodeConfigPanel.tsx`**: Configuration panel with expandable sections
    - **`panels/JsonPreviewPanel.tsx`**: JSON preview with Monaco editor integration
  - **`App.tsx`**: Main application component with layout structure
  - **`index.css`**: Global styles including Ant Design customizations
  - **`App.css`**: Layout-specific styles

## Technical Stack

- **React 19**: Frontend library for building the user interface
- **TypeScript**: For type-safe code and improved developer experience
- **React Flow**: For interactive node-based graph visualization and manipulation
- **Ant Design**: UI component library providing a clean, professional interface
- **Monaco Editor**: For JSON preview with syntax highlighting and validation
- **UUID**: For generating unique identifiers for nodes and connections

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Guide

### Creating a New Flow

1. **Add Nodes**: Use the "Add Node" button to create new nodes of different types
2. **Configure Nodes**: Click on a node to open its configuration panel on the right
3. **Connect Nodes**: Drag from one node's handle to another to create connections
4. **Set Routing Conditions**: Configure how the conversation flows between nodes

### Node Configuration

Each node type has specific configuration options:

- **Common Settings**: ID, label, and max turns
- **Content Configuration**: Goals, scripts, and strategies
- **Routing Logic**: Define conditions for transitioning between nodes
- **Advanced Options**: System prompts, user prompts, and pre-actions

### Managing Your Work

1. **Preview JSON**: Click the "Preview JSON" button to see the generated configuration
2. **Save/Load**: Use the save and load functions to manage your work
3. **Export**: Download the final `config.json` file for use in your conversational system

## Data Structure

The generated `config.json` file follows this structure:

```json
{
  "global_nodes": [
    {
      "id": "global-1",
      "type": "global_node",
      "condition": "...",
      "strategies": [...],
      "pre_actions": [...],
      "routers": [...]
    }
  ],
  "nodes": [
    {
      "id": "node-1",
      "type": "start",
      "config": {
        "routers": [...]
      }
    },
    {
      "id": "node-2",
      "type": "persuader",
      "config": {
        "goal": "...",
        "scripts": [...],
        "strategies": [...],
        "routers": [...]
      }
    }
  ]
}
```

## Implementation Details

### Data Flow Architecture

1. User interactions in the visual editor update the React Flow state
2. Node and edge data is managed in the FlowEditor component
3. Configuration changes in the panel update the node data
4. The JSON preview converts the current state to the required format
5. The final configuration can be downloaded as config.json

### Routing System

The editor supports three types of routing conditions:
- **Force**: Unconditional routing to the next node
- **Semantic**: Routing based on semantic matching of user input
- **Parameter**: Routing based on parameter values collected during conversation

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
