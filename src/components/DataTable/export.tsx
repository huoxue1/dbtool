import { showSaveDialog } from "@/utils/preload";
import { Button, Form, Input, InputRef, Select, Space } from "antd";
import React from "react";
import styles from './export.less';

interface ExportProps {
    onExport: (type: string, path: string) => void;
    onCancel?: () => void;
    tableName?: string;
}

interface ExportState {
  exportType: 'csv' | 'excel' | 'json' | 'sql';
  exportPath: string;
}

class Export extends React.Component<ExportProps, ExportState> {
  constructor(props: ExportProps) {
    super(props);
    this.state = {
      exportType: 'csv',
      exportPath: ''
    }
  }

  exportTypeRef = React.createRef<any>();

  getFileExtension = () => {
    switch(this.state.exportType) {
      case 'csv': return 'csv';
      case 'excel': return 'xlsx';
      case 'json': return 'json';
      case 'sql': return 'sql';
      default: return 'csv';
    }
  }

  selectFile = async () => {
    const ext = this.getFileExtension();
    const defaultName = `${this.props.tableName || 'export'}.${ext}`;
    
    try {
      const result = await showSaveDialog({
        filters: [{
          name: '导出文件',
          extensions: [ext]
        }],
        defaultPath: defaultName,
        title: '选择导出位置'
      });
      console.log(result);
      if (result) {
        this.setState({ exportPath: result });
        this.exportTypeRef.current?.setFieldValue('exportPath', result);
      }
    } catch (error) {
      console.error('File selection failed:', error);
    }
  }

  handleSubmit = () => {
    const { exportType, exportPath } = this.state;
    if (exportPath) {
      this.props.onExport(exportType, exportPath);
    }
  }

  render() {
    const { onCancel } = this.props;
    const { exportType, exportPath } = this.state;

    return (
      <div className={styles.exportForm}>
        <Form ref={this.exportTypeRef} layout="vertical">
          <Form.Item label="导出格式" required>
            <Select
              value={exportType}
              onChange={(value) => this.setState({ exportType: value })}
            >
              <Select.Option value="csv">CSV</Select.Option>
              <Select.Option value="excel">Excel</Select.Option>
              <Select.Option value="json">JSON</Select.Option>
              <Select.Option value="sql">SQL</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="exportPath" label="导出位置" required>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={exportPath}
                placeholder="选择保存位置"
                readOnly
              />
              <Button type="primary" onClick={this.selectFile}>
                选择
              </Button>
            </Space.Compact>
          </Form.Item>

          <Form.Item className={styles.formFooter}>
            <Space>
              {onCancel && (
                <Button onClick={onCancel}>
                  取消
                </Button>
              )}
              <Button 
                type="primary" 
                onClick={this.handleSubmit}
                disabled={!exportPath}
              >
                导出
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default Export;
