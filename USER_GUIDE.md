# Task Graph Editor - User Guide

This guide will help you understand how to use the Task Graph Editor to create and configure task graphs for LLM-based conversational systems.

## Getting Started

1. Launch the application by running `npm start` in the project directory
2. Open your browser to [http://localhost:3000](http://localhost:3000)

## Creating Your First Task Graph

### Step 1: Add Nodes

1. Click the "Add Node" button in the top-right corner
2. Select a node type from the dropdown:
   - **Start**: Use this as the entry point for your conversation flow (you should have only one)
   - **End**: Use this as the termination point for your conversation flow
   - **Persuader**: Use this for guiding users through persuasive dialogue
   - **Collector**: Use this for collecting information from users
   - **Selector**: Use this for making decisions based on user input
   - **Global Node**: Use this for handling special conditions and exceptions
3. Enter a unique ID for the node (this will be used in the configuration file)
4. Click "OK" to create the node

### Step 2: Configure Nodes

1. Click on a node in the graph to open its configuration panel
2. The configuration panel has multiple sections:
   - **Basic Configuration**: Set the node ID, type, and basic properties
   - **Scripts Configuration**: Add scripts for the node to use in conversation
   - **Routers Configuration**: Define how to navigate to other nodes
   - **Strategies Configuration**: Set up different strategies for different situations
   - **Slot Infos Configuration**: Define information slots to collect (for Collector nodes)
   - **Pre Actions Configuration**: Set up actions to perform before the node is executed
   - **Prompts Configuration**: Configure system and user prompts for the LLM
   - **Max Turn Action Configuration**: Define what happens when max turns are reached

3. Expand each section by clicking on it to configure the specific parameters
4. For text fields that require longer input (like prompts), you can resize the text area by dragging the bottom-right corner

### Step 3: Connect Nodes

1. Hover over a node to see the connection handles (dots at the top and bottom)
2. Click and drag from the bottom handle of one node to the top handle of another node to create a connection
3. When you create a connection, a router is automatically added to the source node with a "force" condition type
4. You can modify the router's condition type and add a condition in the source node's configuration panel

### Step 4: Configure Global Nodes

1. Add a Global Node using the "Add Node" button
2. Configure its condition to determine when it should be triggered
3. Set up strategies and routers for the global node
4. Global nodes will be included in the "global_nodes" section of the config.json file

### Step 5: Preview and Export

1. Click the "Preview JSON" button in the top-right corner to see the generated config.json
2. Review the JSON to ensure it matches your expected configuration
3. Click the "Download config.json" button to save the file
4. You can also copy the JSON to the clipboard using the "Copy to Clipboard" button

## Working with Node Types

### Start Node

- Must have at least one router with "force" condition type
- Typically points to the first node in your conversation flow
- Should have only one per task graph

### End Node

- Has no outgoing connections
- Marks the end of a conversation path
- Can have multiple end nodes in a task graph

### Persuader Node

- Used for guiding users through persuasive dialogue
- Configure goals, scripts, and strategies
- Set up routers to determine the next node based on user responses

### Collector Node

- Used for collecting specific information from users
- Configure slot_infos to define what information to collect
- Set up scripts to guide the user in providing the information

### Selector Node

- Used for making decisions based on user input
- Configure routers with different condition types:
  - **Semantic**: Route based on semantic understanding of user input
  - **Parameter**: Route based on parameter values
  - **Force**: Always route to the specified node

### Global Node

- Handles special conditions that can occur at any point
- Configure the condition to determine when it should be triggered
- Can override the normal flow of conversation

## Tips and Best Practices

1. **Plan Your Graph**: Sketch your conversation flow before building it in the editor
2. **Use Meaningful IDs**: Choose node IDs that describe their purpose
3. **Start Simple**: Begin with a basic flow and add complexity gradually
4. **Test Thoroughly**: Export your config.json and test it with your LLM system
5. **Use Global Nodes Sparingly**: Only use them for truly global conditions
6. **Organize Routers**: Order your routers from most specific to most general
7. **Document Your Nodes**: Use the goal field to document what each node does

## Troubleshooting

- **Node Connections Not Working**: Ensure you're dragging from the bottom handle of the source node to the top handle of the target node
- **Changes Not Saving**: Make sure to click outside the input field after making changes
- **JSON Export Issues**: Check that all required fields are filled in for each node
- **Node ID Conflicts**: Ensure each node has a unique ID

## Example Task Graph

A simple task graph might include:

1. **Start Node**: Entry point
2. **Persuader Node**: Introduce the conversation topic
3. **Collector Node**: Gather user information
4. **Selector Node**: Decide next steps based on collected information
5. **Persuader Node**: Provide personalized recommendations
6. **End Node**: Conclude the conversation

With a **Global Node** to handle user requests to speak to a human agent at any point.

---

For more information, refer to the project README.md file or contact the development team. 