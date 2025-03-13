# Task Graph Editor

A visual editor for configuring task graphs used in LLM-based conversational systems. This tool allows you to create, edit, and manage task nodes and their relationships, ultimately generating a standardized `config.json` file.

## Features

- **Visual Node Editor**: Create and connect different types of nodes (start, end, persuader, collector, selector, global_node)
- **Node Configuration**: Configure each node's parameters, including goals, scripts, routers, and strategies
- **JSON Export**: Generate and download the final `config.json` file

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
  - **`types/index.ts`**: TypeScript interfaces for all data structures used in the application
  - **`components/`**: React components
    - **`FlowEditor.tsx`**: Main component for the graph editor, handles node and edge management
    - **`nodes/NodeTypes.tsx`**: Custom node components for React Flow visualization
    - **`panels/NodeConfigPanel.tsx`**: Panel for configuring node properties with expandable sections
    - **`panels/JsonPreviewPanel.tsx`**: Panel for previewing and downloading the JSON configuration
  - **`App.tsx`**: Main application component that renders the layout and FlowEditor
  - **`App.css`**: Global styles for the application layout
  - **`index.css`**: Global styles including Ant Design customizations and React Flow overrides
  - **`index.tsx`**: Entry point for the React application

### Key Technologies

- **React**: Frontend library for building the user interface
- **TypeScript**: For type-safe code and better developer experience
- **React Flow**: For interactive node-based graph visualization
- **Ant Design**: UI component library for a clean, professional interface
- **Monaco Editor**: For JSON preview with syntax highlighting

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

## Usage

1. **Add Nodes**: Click the "Add Node" button to create new nodes
2. **Configure Nodes**: Click on a node to open its configuration panel
3. **Connect Nodes**: Drag from one node's handle to another to create connections
4. **Preview JSON**: Click the "Preview JSON" button to see the generated configuration
5. **Download**: Use the download button in the JSON preview to save the `config.json` file

## Configuration Structure

The generated `config.json` file follows this structure:

```json
{
  "global_nodes": [],  
  "nodes": []
}
```

Where:
- `global_nodes`: Contains global nodes for handling special scenarios
- `nodes`: Contains regular nodes that form the main conversation flow

## Implementation Details

### Data Flow

1. User creates and configures nodes in the visual editor
2. Node data is stored in React state within the FlowEditor component
3. When a node is selected, its data is passed to the NodeConfigPanel
4. Changes made in the panel update the node data in the FlowEditor state
5. When the user requests a JSON preview, the current state is converted to the required format
6. The user can download the generated JSON as config.json

### Node Configuration

Each node type has specific configuration options:

- **Start Node**: Simple configuration with force routing to the next node
- **End Node**: Minimal configuration as it's a termination point
- **Persuader/Collector/Selector Nodes**: Full configuration with goals, scripts, strategies, and routing options
- **Global Node**: Special configuration for handling global conditions and exceptions

## License

MIT
