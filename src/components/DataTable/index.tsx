import React, { useEffect, useState } from 'react';
import { Table, Card, Form, Input, Button, Space, Select, Input as AntdInput, Pagination, Drawer, message } from 'antd';
import type { TableProps } from 'antd';
import { SearchOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from '@umijs/max';
import styles from './index.less';
import Export from './export';

const { TextArea } = AntdInput;
const { Option } = Select;

interface DataTableProps {
  connectionName: string;
  dbName: string;
  tableName: string;
}

const DataTable: React.FC<DataTableProps> = ({ connectionName, dbName, tableName }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { data, columns, pagination, loading, displayMode } = useSelector((state: any) => state.table);
  const [exportDrawerVisible, setExportDrawerVisible] = useState(false);

  const fetchData = (
    page: number = pagination.current,
    pageSize: number = pagination.pageSize,
    sorter: any = {},
    where: string = ''
  ) => {
    dispatch({
      type: 'table/fetchTableData',
      payload: {
        connectionName,
        dbName,
        tableName,
        page,
        pageSize,
        sorter,
        where,
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, [connectionName, dbName, tableName]);

  const handleTableChange: TableProps<any>['onChange'] = (pag, _, sorter) => {
    fetchData(pag.current, pag.pageSize, sorter);
  };

  const handleSearch = (values: any) => {
    fetchData(1, pagination.pageSize, {}, values.where);
  };

  const handleRefresh = () => {
    form.resetFields();
    fetchData(1, pagination.pageSize);
  };

  const handleDisplayModeChange = (mode: 'table' | 'text') => {
    dispatch({
      type: 'table/setDisplayMode',
      payload: mode,
    });
  };

  const handleExport = () => {
    setExportDrawerVisible(true);
  };

  const renderDataContent = () => {
    if (displayMode === 'table') {
      return (
        <Table
          columns={columns}
          dataSource={data}
          pagination={pagination}
          onChange={handleTableChange}
          loading={loading}
          scroll={{ x: 'max-content' }}
          className={styles.table}
        />
      );
    }

    return (
      <div className={styles.textDisplay}>
        <TextArea
          value={JSON.stringify(data, null, 2)}
          autoSize={{ minRows: 10, maxRows: 30 }}
          readOnly
          className={styles.jsonText}
        />
        <div className={styles.textFooter}>
          <Pagination
            {...pagination}
            onChange={(page, pageSize) => {
              fetchData(page, pageSize);
            }}
            onShowSizeChange={(current, size) => {
              fetchData(1, size);
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={styles.dataTable}>
      <Card className={styles.queryCard}>
        <div className={styles.queryHeader}>
          <Form
            form={form}
            layout="inline"
            onFinish={handleSearch}
          >
            <Form.Item name="where" label="条件">
              <Input placeholder="条件" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                  查询
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
          
          <Space>
            <Select
              value={displayMode}
              onChange={handleDisplayModeChange}
              className={styles.displayModeSelect}
            >
              <Option value="table">表格模式</Option>
              <Option value="text">文本模式</Option>
            </Select>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleExport}
              title="导出数据"
            >
              导出
            </Button>
          </Space>
        </div>
      </Card>

      {renderDataContent()}

      <Drawer
        title="导出数据"
        placement="right"
        width={400}
        onClose={() => setExportDrawerVisible(false)}
        open={exportDrawerVisible}
      >
        <Export
          tableName={tableName}
          onExport={async (type, path) => {
            try {
              await dispatch({
                type: 'table/exportData',
                payload: {
                  type,
                  path,
                  connectionName,
                  dbName,
                  tableName,
                  data,
                  where: form.getFieldValue('where')
                }
              });
              message.success('导出成功');
              setExportDrawerVisible(false);
            } catch (error) {
              message.error('导出失败: ' + error.message);
            }
          }}
          onCancel={() => setExportDrawerVisible(false)}
        />
      </Drawer>
    </div>
  );
};

export default DataTable; 