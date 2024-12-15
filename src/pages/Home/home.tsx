import { Layout, Menu, Button } from 'antd';
import { useModel, useDispatch, useSelector } from '@umijs/max';
import styles from './index.less';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { useEffect, useState } from 'react';
import { LoadingOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import DataTable from '@/components/DataTable';

const { Content, Sider } = Layout;

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const { menuItems, expandedKeys, selectedKey, maxLevel, loadingKeys } = useSelector((state: any) => state.menu);
  const [siderWidth, setSiderWidth] = useState(200);
  const [editorHeight, setEditorHeight] = useState(300);
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [previousHeight, setPreviousHeight] = useState(300); // 保存收起前的高度
  const [selectedTable, setSelectedTable] = useState<{
    connectionName: string;
    dbName: string;
    tableName: string;
  } | null>(null);

  // 从选中的key中获取连接名、数据库名、表名
  const getConnAndDbAndTable = (key: string) => {
    const [, conn, db, table] = key.split('/');
    return { conn, db, table };
  };

  // 根据层级计算宽度
  const calculateWidth = (level: number) => {
    const baseWidth = 200; // 增加基础宽度到250px
    const levelWidth = 60;  // 增加每层宽度到80px
    return baseWidth + (level - 1) * levelWidth;
  };

  // 监听最大层级变化，自动调整宽度
  useEffect(() => {
    const newWidth = calculateWidth(maxLevel);
    setSiderWidth(newWidth);
  }, [maxLevel]);

  useEffect(() => {
    dispatch({
      type: 'menu/buildMenuItems',
    });
  }, []);

  // 添加渲染图标的函数
  const renderIcon = (key: string, defaultIcon: React.ReactNode) => {
    return loadingKeys.has(key) ? <LoadingOutlined spin /> : defaultIcon;
  };

  const onOpenChange = async (keys: string[]) => {
    console.log(keys);
    const newKey = keys.find(key => !expandedKeys.includes(key));

    if (newKey) {
      if (newKey.startsWith('conn/')) {
        const connectionName = newKey.replace('conn/', '');
        dispatch({
          type: 'menu/loadDatabases',
          payload: { connectionName },
        });
      }
      else if (newKey.startsWith('db/')) {
        const [, connectionName, dbName] = newKey.split('/');
        dispatch({
          type: 'menu/loadTables',
          payload: { connectionName, dbName },
        });
      }
    }
    dispatch({
      type: 'menu/setExpandedKeys',
      payload: keys,
    });
  };

  // 处理编辑器收起/展开
  const toggleEditor = () => {
    if (!editorCollapsed) {
      setPreviousHeight(editorHeight);
      setEditorHeight(40); // 收起时的最小高度
    } else {
      setEditorHeight(previousHeight);
    }
    setEditorCollapsed(!editorCollapsed);
  };

  // 修改菜单选择处理函数
  const handleMenuSelect = ({ key }: { key: string }) => {
    dispatch({
      type: 'menu/setSelectedKey',
      payload: key,
    });

    if (key.startsWith('table/')) {
      const [, connectionName, dbName, tableName] = key.split('/');
      // 收起编辑器

      setEditorCollapsed(true);
      setPreviousHeight(editorHeight);
      setEditorHeight(40); // 收起时的最小高度
      
      setSelectedTable({ connectionName, dbName, tableName });
    } else {
      setSelectedTable(null);
    }
  };

  return (
    <Layout>
      <ResizableBox
        width={siderWidth}
        height={Infinity}
        minConstraints={[250, Infinity]}
        maxConstraints={[600, Infinity]}
        onResize={(e, { size }) => setSiderWidth(size.width)}
        handle={<div className={styles.dragHandle} />}
        axis="x"
      >
        <Sider 
          width={siderWidth}
          collapsible={false}
          style={{ 
            height: '100%',
            overflow: 'hidden',
            background: '#fff'
          }}
        >
          <div className={styles.menuContainer}>
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              expandedKeys={expandedKeys}
              style={{ 
                borderRight: 0,
                width: siderWidth,
              }}
              items={menuItems}
              onOpenChange={onOpenChange}
              onSelect={handleMenuSelect}
            />
          </div>
        </Sider>
      </ResizableBox>
      
      <Layout>
        <Content className={styles.content}>
          <div className={styles.editorWrapper}>
            <ResizableBox
              width={Infinity}
              height={editorHeight}
              minConstraints={[Infinity, editorCollapsed ? 40 : 100]}
              maxConstraints={[Infinity, 800]}
              onResize={(e, { size }) => !editorCollapsed && setEditorHeight(size.height)}
              handle={<div className={styles.dragHandleHorizontal} />}
              axis="y"
            >
              <div className={styles.editorArea}>
                <div className={styles.editorHeader}>
                  <span>编辑器</span>
                  <Button
                    type="text"
                    icon={editorCollapsed ? <DownOutlined /> : <UpOutlined />}
                    onClick={toggleEditor}
                  />
                </div>
                <div className={styles.editorContent} style={{ display: editorCollapsed ? 'none' : 'block' }}>
                  {/* 编辑器内容 */}
                </div>
              </div>
            </ResizableBox>
          </div>
          
          <div className={styles.dataArea}>
            {selectedTable && (
              <DataTable
                connectionName={selectedTable.connectionName}
                dbName={selectedTable.dbName}
                tableName={selectedTable.tableName}
              />
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;
