import React from 'react';
import { Button, Typography, Space } from 'antd';
import { DownloadOutlined, CopyOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { TaskGraphConfig } from '../../types';

const { Title } = Typography;

interface JsonPreviewPanelProps {
  taskGraph: TaskGraphConfig;
}

const JsonPreviewPanel: React.FC<JsonPreviewPanelProps> = ({ taskGraph }) => {
  const jsonString = JSON.stringify(taskGraph, null, 2);

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
  };

  return (
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4}>JSON Preview</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={handleDownload}
          >
            Download config.json
          </Button>
          <Button 
            icon={<CopyOutlined />} 
            onClick={handleCopy}
          >
            Copy to Clipboard
          </Button>
        </Space>
      </div>
      
      <div style={{ flex: 1, border: '1px solid #d9d9d9', borderRadius: '4px', overflow: 'hidden' }}>
        <Editor
          height="100%"
          defaultLanguage="json"
          value={jsonString}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

export default JsonPreviewPanel; 