import { Layout, Button, Drawer } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import styles from './index.less';
import Home from './home';
import CreateConnection from './Connecttion/insert';
import UpdateConnection from './Connecttion/update';
import { useState } from 'react';

const { Header } = Layout;

const HomePage: React.FC = () => {
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [updateDrawerOpen, setUpdateDrawerOpen] = useState(false);

  return (
    <Layout style={{ height: '100vh' }}>
      <Header className={styles.header}>
        <div className={styles.toolbar}>
          <Button 
            type="text"
            icon={<PlusOutlined />}
            onClick={() => setCreateDrawerOpen(true)}
            className={styles.toolbarButton}
          >
            新增连接
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => setUpdateDrawerOpen(true)}
            className={styles.toolbarButton}
          >
            修改连接
          </Button>
        </div>
      </Header>
      
      <Home />

      {/* 新增连接抽屉 */}
      <Drawer
        title="新增连接"
        placement="right"
        width={500}
        onClose={() => setCreateDrawerOpen(false)}
        open={createDrawerOpen}
      >
        <CreateConnection />
      </Drawer>

      {/* 修改连接抽屉 */}
      <Drawer
        title="修改连接"
        placement="right"
        width={500}
        onClose={() => setUpdateDrawerOpen(false)}
        open={updateDrawerOpen}
      >
        <UpdateConnection />
      </Drawer>
    </Layout>
  );
};

export default HomePage;
