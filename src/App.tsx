import React from 'react';
import { Layout, Typography } from 'antd';
import FlowEditor from './components/FlowEditor';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Header style={{ background: '#fff', padding: '0 16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
        <Title level={3} style={{ margin: '16px 0' }}>Task Graph Editor</Title>
      </Header>
      <Content style={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        <FlowEditor />
      </Content>
    </Layout>
  );
}

export default App;
